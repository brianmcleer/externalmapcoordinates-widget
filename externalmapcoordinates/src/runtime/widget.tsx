import { React, AllWidgetProps, jsx, loadArcGISJSAPIModules } from 'jimu-core'
import type { IMConfig } from '../config'
import { JimuMapViewComponent } from 'jimu-arcgis'
import type { JimuMapView } from 'jimu-arcgis'
import { WidgetPlaceholder, Button, TextInput, Tooltip } from 'jimu-ui'

import '../index.css'

import Point from 'esri/geometry/Point'
import SpatialReference from 'esri/geometry/SpatialReference'
import defaultMessages from './translations/default'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const squareCrossIcon = require('./assets/target-square-cross.svg')

// ── Debug logging — filter console by [EMC] ──────────────────────────────────
const ERR = (...args: any[]) => console.error('[EMC]', ...args)
const WARN = (...args: any[]) => console.warn('[EMC]', ...args)

// ── EB 1.20 notes ─────────────────────────────────────────────────────────────
// projection.load() hangs in EB 1.20 because it triggers a WASM load that stalls.
// The map is already rendering (in any SR), so the JSAPI projection engine is
// already loaded internally. We do projection in pure math: Web Mercator, UTM,
// and Lambert Conformal Conic state plane (Colorado preloaded, extensible).
// addClickListener is registered as soon as view.when() resolves, independent
// of module loading. Graphic is only needed when a click fires.
// ─────────────────────────────────────────────────────────────────────────────

// ── State plane (Lambert Conformal Conic) parameter table ────────────────────
// Each entry is keyed by WKID. To add zones for other states, append entries.
// Parameters use the EPSG/ESRI definitions. Lengths are in meters; angular
// units in degrees. If the source units are US survey feet, set unitsFromMeters
// to 0.3048006096 so easting/northing are converted to meters before projection.
//
// References:
//   Colorado:  https://epsg.io/2231  https://epsg.io/2232  https://epsg.io/2233
//              https://epsg.io/26953 https://epsg.io/26954 https://epsg.io/26955
//   ESRI variants: 102253, 102254, 102255 (ftUS equivalents)
//
interface LCCParams {
    lat0: number     // latitude of origin (degrees)
    lon0: number     // central meridian (degrees)
    lat1: number     // first standard parallel (degrees)
    lat2: number     // second standard parallel (degrees)
    E0: number       // false easting (meters)
    N0: number       // false northing (meters)
    unitsFromMeters: number  // multiplier to convert source unit to meters (1 for meters, 0.3048006096 for ftUS)
}

const FT_US_TO_M = 0.3048006096
const COLORADO_E0_M = 914401.8289   // 3,000,000 ftUS in meters
const COLORADO_N0_M = 304800.6096   // 1,000,000 ftUS in meters

const LCC_TABLE: { [wkid: number]: LCCParams } = {
    // Colorado North
    2231:   { lat0: 39 + 20 / 60, lon0: -105.5, lat1: 39 + 43 / 60, lat2: 40 + 47 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: FT_US_TO_M },
    26953:  { lat0: 39 + 20 / 60, lon0: -105.5, lat1: 39 + 43 / 60, lat2: 40 + 47 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: 1 },
    102253: { lat0: 39 + 20 / 60, lon0: -105.5, lat1: 39 + 43 / 60, lat2: 40 + 47 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: FT_US_TO_M },
    // Colorado Central
    2232:   { lat0: 37 + 50 / 60, lon0: -105.5, lat1: 38 + 27 / 60, lat2: 39 + 45 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: FT_US_TO_M },
    26954:  { lat0: 37 + 50 / 60, lon0: -105.5, lat1: 38 + 27 / 60, lat2: 39 + 45 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: 1 },
    102254: { lat0: 37 + 50 / 60, lon0: -105.5, lat1: 38 + 27 / 60, lat2: 39 + 45 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: FT_US_TO_M },
    // Colorado South
    2233:   { lat0: 36 + 40 / 60, lon0: -105.5, lat1: 37 + 14 / 60, lat2: 38 + 26 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: FT_US_TO_M },
    26955:  { lat0: 36 + 40 / 60, lon0: -105.5, lat1: 37 + 14 / 60, lat2: 38 + 26 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: 1 },
    102255: { lat0: 36 + 40 / 60, lon0: -105.5, lat1: 37 + 14 / 60, lat2: 38 + 26 / 60, E0: COLORADO_E0_M, N0: COLORADO_N0_M, unitsFromMeters: FT_US_TO_M },
}

interface IState {
    latitude: string
    longitude: string
    scale: number
    zoom: number
    Pictometry3dUrl: string
    GoogleStreetViewUrl: string
    GoogleMaps3DUrl: string
    BingSatelliteUrl: string
    BingStreetsideUrl: string
    mapViewReady: boolean
    clicked: boolean
    coordinatesCopied: boolean
    jimuMapView: JimuMapView | null
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, IState> {
    // Module handles stored as instance properties so they do not cause re-renders
    private GraphicModule: any = null
    // View, pin, and click listener kept as instance variables so they survive
    // setState races and are reachable during unmount.
    private currentView: any = null
    private currentPinGraphic: any = null
    private clickListenerHandle: any = null
    // Save the view's original highlightOptions so we restore exactly what was
    // there, not a hardcoded default. Other widgets may have configured it.
    private savedViewHighlightOptions: any = undefined
    // Layer-view highlight suppression bookkeeping. Other EB widgets (Select,
    // Feature Info, Search, etc.) write to per-layer-view highlightOptions, which
    // override the view-level setting. We override them to transparent on open
    // and restore the originals on close.
    private layerViewChangeHandle: any = null
    private savedLayerViewHighlights: Array<{ lv: any, opts: any }> = []
    // Guard setState during unmount to avoid React warnings.
    private isUnmounted = false

    state: IState = {
        latitude: '',
        longitude: '',
        scale: 0,
        zoom: 0,
        Pictometry3dUrl: '',
        GoogleStreetViewUrl: '',
        GoogleMaps3DUrl: '',
        BingSatelliteUrl: '',
        BingStreetsideUrl: '',
        mapViewReady: false,
        clicked: false,
        coordinatesCopied: false,
        jimuMapView: null
    }

    textInputRef = React.createRef<HTMLInputElement>()
    pictometryBtnRef = React.createRef<HTMLButtonElement>()
    streetViewBtnRef = React.createRef<HTMLButtonElement>()
    googleMapsBtnRef = React.createRef<HTMLButtonElement>()
    bingSatelliteBtnRef = React.createRef<HTMLButtonElement>()
    bingStreetsideBtnRef = React.createRef<HTMLButtonElement>()
    copyBtnRef = React.createRef<HTMLButtonElement>()

    // Safe setState that no-ops after unmount.
    private safeSetState = (partial: Partial<IState>) => {
        if (this.isUnmounted) { return }
        this.setState(partial as any)
    }

    // ── Lifecycle ────────────────────────────────────────────────────────────────
    componentDidMount() {
        // Load Graphic so we can drop a pin. Click registration does not wait on
        // this since by the time the user clicks, the module is ready.
        loadArcGISJSAPIModules(['esri/Graphic'])
            .then(([Graphic]: any[]) => {
                this.GraphicModule = Graphic
            })
            .catch((e: any) => { ERR('Graphic load failed:', e) })

        document.addEventListener('keydown', this.handleKeyDown)
    }

    componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
        // Clean up when widget closes (OPENED -> CLOSED).
        if (prevProps.state === 'OPENED' && this.props.state === 'CLOSED') {
            this.handleWidgetClose()
        }
        // Re-initialize when widget re-opens (CLOSED -> OPENED). JimuMapViewComponent
        // does NOT re-fire onActiveViewChange because the view itself hasn't changed,
        // so we re-attach the click listener and re-disable popup/highlight ourselves.
        if (prevProps.state === 'CLOSED' && this.props.state === 'OPENED') {
            this.handleWidgetReopen()
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true
        this.handleWidgetClose()
        document.removeEventListener('keydown', this.handleKeyDown)

        // Backup cleanup in case state-based cleanup didn't fire.
        const view = this.currentView
        const pin = this.currentPinGraphic
        if (view && pin) {
            setTimeout(() => {
                try { view.graphics.remove(pin) } catch (_) { }
            }, 100)
        }
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { this.resetState() }
    }

    // ── View connection ──────────────────────────────────────────────────────────
    activeViewChangeHandler = (jmv: JimuMapView) => {
        if (!jmv?.view) { return }

        this.currentView = jmv.view

        jmv.view.when(
            () => {
                this.applyViewSuppression(jmv.view)
                this.safeSetState({ jimuMapView: jmv, mapViewReady: true })
                this.addClickListener(jmv)
            },
            (_err: any) => {
                this.safeSetState({ jimuMapView: jmv, mapViewReady: true })
                this.addClickListener(jmv)
            }
        )
    }

    handleWidgetReopen = () => {
        const { jimuMapView } = this.state
        if (!jimuMapView?.view) { return }
        this.applyViewSuppression(jimuMapView.view)
        this.addClickListener(jimuMapView)
    }

    // ── Popup and highlight suppression ──────────────────────────────────────────
    // Disable the view's popup, save the original view-level highlightOptions so
    // we can restore exactly that value on close, then walk all layer views to
    // override their per-layer highlightOptions (which is how other EB widgets
    // like Select, Feature Info, and Search render highlights).
    applyViewSuppression = (view: any) => {
        if (!view) { return }

        try { view.popupEnabled = false } catch (_) { }
        try {
            if (view.popup && 'autoCloseEnabled' in view.popup) {
                // We want any stray popup to close itself the moment the view
                // changes, not linger. (The original code had this set to false,
                // which kept stray popups visible. Setting true is the right
                // direction now that popupEnabled = false already suppresses
                // normal popup behavior.)
                (view.popup as any).autoCloseEnabled = true
            }
        } catch (_) { }

        // Save the original view-level highlightOptions exactly once per open
        // cycle so we restore the user's actual setting, not a hardcoded default.
        if (this.savedViewHighlightOptions === undefined) {
            try { this.savedViewHighlightOptions = view.highlightOptions } catch (_) { }
        }
        try {
            view.highlightOptions = { color: [0, 0, 0, 0], fillOpacity: 0, haloOpacity: 0 }
        } catch (_) { }

        this.suppressLayerViewHighlights(view)
    }

    suppressLayerViewHighlights = (view: any) => {
        if (!view) { return }
        const transparent = { color: [0, 0, 0, 0], fillOpacity: 0, haloOpacity: 0 }

        const suppress = (lv: any) => {
            if (!lv) { return }
            try {
                const alreadySaved = this.savedLayerViewHighlights.some(s => s.lv === lv)
                if (!alreadySaved) {
                    this.savedLayerViewHighlights.push({ lv, opts: lv.highlightOptions })
                }
                lv.highlightOptions = transparent
            } catch (_) { }
        }

        try { view.allLayerViews?.forEach(suppress) } catch (_) { }

        if (this.layerViewChangeHandle) {
            try { this.layerViewChangeHandle.remove() } catch (_) { }
            this.layerViewChangeHandle = null
        }
        try {
            this.layerViewChangeHandle = view.allLayerViews?.on('change', (event: any) => {
                event?.added?.forEach(suppress)
            })
        } catch (_) { }
    }

    restoreSuppression = () => {
        // Restore view-level highlightOptions to whatever it was before we touched it.
        if (this.currentView && this.savedViewHighlightOptions !== undefined) {
            try { this.currentView.highlightOptions = this.savedViewHighlightOptions } catch (_) { }
            this.savedViewHighlightOptions = undefined
        }

        // Restore per-layer-view highlightOptions.
        try {
            this.savedLayerViewHighlights.forEach(({ lv, opts }) => {
                try { lv.highlightOptions = opts } catch (_) { }
            })
        } catch (_) { }
        this.savedLayerViewHighlights = []
        if (this.layerViewChangeHandle) {
            try { this.layerViewChangeHandle.remove() } catch (_) { }
            this.layerViewChangeHandle = null
        }
    }

    // ── Click listener ───────────────────────────────────────────────────────────
    addClickListener = (jmv: JimuMapView) => {
        this.removeClickListener()
        if (!jmv?.view) { return }

        this.clickListenerHandle = jmv.view.on('click', (evt: any) => {
            // Suppress other widgets' click handlers (Select, Feature Info, Search,
            // etc.) so they cannot highlight features on the same click.
            try { evt.stopPropagation() } catch (_) { }

            const point = evt.mapPoint
            if (!point) { return }
            this.handleMapClick(point, jmv.view.spatialReference, jmv)
        })
    }

    removeClickListener = () => {
        if (this.clickListenerHandle) {
            try { this.clickListenerHandle.remove() } catch (_) { }
            this.clickListenerHandle = null
        }
    }

    // ── Projection ───────────────────────────────────────────────────────────────
    // Synchronous, pure-math. Handles WGS84 passthrough, Web Mercator, UTM, and
    // Lambert Conformal Conic state plane (Colorado preloaded, extensible via
    // the LCC_TABLE at the top of this file).
    projectToWGS84 = (point: Point, spatialReference: SpatialReference): Point | null => {
        const wkid = spatialReference?.wkid ?? (spatialReference as any)?.latestWkid

        if (!spatialReference || wkid === 4326) {
            return point
        }

        // Web Mercator (EPSG:3857 / ESRI:102100)
        if (wkid === 102100 || wkid === 3857) {
            const lon = (point.x / 20037508.34) * 180
            const lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((point.y / 20037508.34) * Math.PI / 180)) - Math.PI / 2)
            return new Point({ x: lon, y: lat, spatialReference: new SpatialReference({ wkid: 4326 }) })
        }

        // UTM North: EPSG 32601–32660 (WGS84) or 26901–26960 (NAD83)
        // UTM South: EPSG 32701–32760
        let utmZone = 0
        let isNorth = true
        if (wkid >= 32601 && wkid <= 32660) { utmZone = wkid - 32600; isNorth = true }
        else if (wkid >= 32701 && wkid <= 32760) { utmZone = wkid - 32700; isNorth = false }
        else if (wkid >= 26901 && wkid <= 26960) { utmZone = wkid - 26900; isNorth = true }

        if (utmZone > 0) {
            const result = this.utmToLatLon(point.x, point.y, utmZone, isNorth)
            if (!result) { return null }
            return new Point({ x: result.lon, y: result.lat, spatialReference: new SpatialReference({ wkid: 4326 }) })
        }

        // Lambert Conformal Conic state plane.
        const lccParams = LCC_TABLE[wkid]
        if (lccParams) {
            const result = this.lccToLatLon(point.x, point.y, lccParams)
            if (!result) { return null }
            return new Point({ x: result.lon, y: result.lat, spatialReference: new SpatialReference({ wkid: 4326 }) })
        }

        WARN('Unsupported WKID:', wkid)
        return null
    }

    // Standard Transverse Mercator reverse projection — WGS84 ellipsoid.
    utmToLatLon = (easting: number, northing: number, zone: number, isNorth: boolean): { lat: number, lon: number } | null => {
        try {
            const a = 6378137.0
            const f = 1 / 298.257223563
            const e2 = 2 * f - f * f
            const e4 = e2 * e2
            const e6 = e4 * e2
            const k0 = 0.9996
            const E0 = 500000
            const N0 = isNorth ? 0 : 10000000

            const M = (northing - N0) / k0
            const mu = M / (a * (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256))

            const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))
            const phi1 = mu
                + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu)
                + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu)
                + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu)
                + (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * mu)

            const sinPhi1 = Math.sin(phi1)
            const cosPhi1 = Math.cos(phi1)
            const tanPhi1 = sinPhi1 / cosPhi1

            const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1)
            const T1 = tanPhi1 * tanPhi1
            const C1 = (e2 / (1 - e2)) * cosPhi1 * cosPhi1
            const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5)
            const D = (easting - E0) / (N1 * k0)

            const D2 = D * D; const D3 = D2 * D; const D4 = D3 * D
            const D5 = D4 * D; const D6 = D5 * D
            const T12 = T1 * T1; const C12 = C1 * C1

            const lat = phi1 - (N1 * tanPhi1 / R1) * (
                D2 / 2
                - (5 + 3 * T1 + 10 * C1 - 4 * C12 - 9 * (e2 / (1 - e2))) * D4 / 24
                + (61 + 90 * T1 + 298 * C1 + 45 * T12 - 252 * (e2 / (1 - e2)) - 3 * C12) * D6 / 720
            )

            const lon0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180
            const lon = lon0 + (
                D
                - (1 + 2 * T1 + C1) * D3 / 6
                + (5 - 2 * C1 + 28 * T1 - 3 * C12 + 8 * (e2 / (1 - e2)) + 24 * T12) * D5 / 120
            ) / cosPhi1

            return { lat: lat * 180 / Math.PI, lon: lon * 180 / Math.PI }
        } catch (e) {
            return null
        }
    }

    // Lambert Conformal Conic inverse projection. NAD83/GRS80 ellipsoid.
    // Snyder 1987, "Map Projections: A Working Manual", pp 105-106.
    lccToLatLon = (easting: number, northing: number, p: LCCParams): { lat: number, lon: number } | null => {
        try {
            // Convert source-unit easting/northing to meters.
            const E = easting * p.unitsFromMeters
            const N = northing * p.unitsFromMeters

            const a = 6378137.0                     // GRS80 semi-major axis
            const f = 1 / 298.257222101             // GRS80 flattening
            const e2 = 2 * f - f * f
            const e = Math.sqrt(e2)

            const toRad = (d: number) => d * Math.PI / 180
            const lat0 = toRad(p.lat0)
            const lon0 = toRad(p.lon0)
            const lat1 = toRad(p.lat1)
            const lat2 = toRad(p.lat2)

            const tFn = (lat: number) => {
                const eSinLat = e * Math.sin(lat)
                return Math.tan(Math.PI / 4 - lat / 2) / Math.pow((1 - eSinLat) / (1 + eSinLat), e / 2)
            }
            const mFn = (lat: number) => {
                const sinLat = Math.sin(lat)
                return Math.cos(lat) / Math.sqrt(1 - e2 * sinLat * sinLat)
            }

            const m1 = mFn(lat1)
            const m2 = mFn(lat2)
            const t1 = tFn(lat1)
            const t2 = tFn(lat2)
            const t0 = tFn(lat0)

            // When the two standard parallels coincide, n = sin(lat1).
            const n = Math.abs(lat1 - lat2) < 1e-12
                ? Math.sin(lat1)
                : (Math.log(m1) - Math.log(m2)) / (Math.log(t1) - Math.log(t2))

            const F = m1 / (n * Math.pow(t1, n))
            const rho0 = a * F * Math.pow(t0, n)

            const dE = E - p.E0
            const dN = rho0 - (N - p.N0)
            // sign(n) so southern aspects work; Colorado is always n>0.
            const rho = Math.sign(n) * Math.sqrt(dE * dE + dN * dN)
            const tPrime = Math.pow(rho / (a * F), 1 / n)
            const theta = Math.atan2(dE, dN)

            const lon = theta / n + lon0

            // Iterative inverse of t(lat). Converges quickly (5 iterations is plenty).
            let lat = Math.PI / 2 - 2 * Math.atan(tPrime)
            for (let i = 0; i < 8; i++) {
                const eSinLat = e * Math.sin(lat)
                const next = Math.PI / 2 - 2 * Math.atan(tPrime * Math.pow((1 - eSinLat) / (1 + eSinLat), e / 2))
                if (Math.abs(next - lat) < 1e-12) { lat = next; break }
                lat = next
            }

            return { lat: lat * 180 / Math.PI, lon: lon * 180 / Math.PI }
        } catch (e) {
            return null
        }
    }

    addPinToMap = (point: Point, jmv: JimuMapView) => {
        if (!this.GraphicModule) { return }
        try {
            // Remove only OUR previous pin, never view.graphics.removeAll().
            // Other widgets may have placed graphics on view.graphics and we
            // must not clobber them.
            if (this.currentPinGraphic) {
                try { jmv.view.graphics.remove(this.currentPinGraphic) } catch (_) { }
                this.currentPinGraphic = null
            }

            const pin = new this.GraphicModule({
                geometry: point,
                symbol: { type: 'simple-marker', color: [226, 119, 40], outline: { color: [255, 255, 255], width: 2 } }
            })
            jmv.view.graphics.add(pin)
            this.currentPinGraphic = pin

            this.announceForScreenReader(
                defaultMessages.srPinPlaced
                    .replace('{lat}', point.y.toFixed(4))
                    .replace('{lon}', point.x.toFixed(4))
            )
        } catch (e) {
            ERR('addPinToMap failed:', e)
        }
    }

    // Screen-reader live region. Element ID is namespaced by widget instance ID.
    announceForScreenReader = (message: string) => {
        const elId = `sr-announcer-${this.props.id}`
        let el = document.getElementById(elId)
        if (!el) {
            el = document.createElement('div')
            el.id = elId
            el.setAttribute('aria-live', 'assertive')
            el.setAttribute('role', 'status')
            el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)'
            document.body.appendChild(el)
        }
        el.textContent = message
    }

    // ── Pictometry URL builder ───────────────────────────────────────────────────
    // Robust to base URLs that already contain query strings or fragments.
    buildPictometryUrl = (baseUrl: string, latitude: string, longitude: string): string => {
        if (!baseUrl) { return '' }
        try {
            const url = new URL(baseUrl)
            url.searchParams.set('x', longitude)
            url.searchParams.set('y', latitude)
            return url.toString()
        } catch (_) {
            // Fallback for malformed URLs that the URL constructor rejects.
            const sep = baseUrl.includes('?') ? '&' : '?'
            return `${baseUrl}${sep}x=${encodeURIComponent(longitude)}&y=${encodeURIComponent(latitude)}`
        }
    }

    // ── Main click handler ───────────────────────────────────────────────────────
    handleMapClick = (point: Point, spatialReference: SpatialReference, jmv: JimuMapView) => {
        const projectedPoint = this.projectToWGS84(point, spatialReference)

        if (!projectedPoint) {
            const wkid = (spatialReference as any)?.wkid ?? (spatialReference as any)?.latestWkid ?? 'unknown'
            this.announceForScreenReader(
                defaultMessages.srUnsupportedSr.replace('{wkid}', String(wkid))
            )
            return
        }

        const latitude = projectedPoint.y.toFixed(8)
        const longitude = projectedPoint.x.toFixed(8)

        this.addPinToMap(point, jmv)

        const pictometryUrl = this.buildPictometryUrl(
            this.props.config?.pictometryBaseUrl || '',
            latitude,
            longitude
        )

        this.safeSetState({
            latitude,
            longitude,
            scale: Math.round(jmv.view.scale),
            zoom: Math.round(jmv.view.zoom),
            clicked: true,
            Pictometry3dUrl: pictometryUrl,
            GoogleStreetViewUrl: `https://www.google.com/maps?q&layer=c&cbll=${latitude},${longitude}&cbp=12,0,0,0,0`,
            GoogleMaps3DUrl: `https://www.google.com/maps/@${latitude},${longitude},300m/data=!3m1!1e3`,
            BingSatelliteUrl: `https://www.bing.com/maps?cp=${latitude}~${longitude}&style=h&lvl=19`,
            BingStreetsideUrl: `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=17.8&style=x&dir=0&pi=0`
        })

        // Move keyboard focus to the first visible action button so the user can
        // tab through links without having to find them.
        const cfg = this.props.config
        if (cfg?.pictometryBaseUrl && cfg.showPictometry !== false && this.pictometryBtnRef.current) {
            this.pictometryBtnRef.current.focus()
        } else if (cfg.showGoogleStreetView !== false && this.streetViewBtnRef.current) {
            this.streetViewBtnRef.current.focus()
        } else if (cfg.showGoogleMaps3D !== false && this.googleMapsBtnRef.current) {
            this.googleMapsBtnRef.current.focus()
        }
    }

    // ── Clipboard ────────────────────────────────────────────────────────────────
    copyToClipboard = () => {
        // Use the ref rather than document.querySelector so multiple instances
        // of this widget on the same page do not interfere with each other.
        const textBox = this.textInputRef.current
        if (!textBox) { return }
        try { textBox.select() } catch (_) { }
        const value = `${this.state.latitude}, ${this.state.longitude}`
        navigator.clipboard.writeText(value)
            .then(() => {
                this.announceForScreenReader(defaultMessages.srCopied)
                this.safeSetState({ coordinatesCopied: true })
                setTimeout(() => { this.safeSetState({ coordinatesCopied: false }) }, 3000)
            })
            .catch((e: any) => { ERR('clipboard write failed:', e) })
    }

    // ── Reset / close ────────────────────────────────────────────────────────────
    // Clear the user's click result. Note: does NOT reset mapViewReady because
    // the map view itself is still connected and ready; only the user's data
    // is being cleared.
    resetState = () => {
        if (this.currentView && this.currentPinGraphic) {
            try { this.currentView.graphics.remove(this.currentPinGraphic) } catch (_) { }
            this.currentPinGraphic = null
        }
        this.safeSetState({
            latitude: '', longitude: '', scale: 0, zoom: 0,
            Pictometry3dUrl: '', GoogleStreetViewUrl: '', GoogleMaps3DUrl: '',
            BingSatelliteUrl: '', BingStreetsideUrl: '',
            clicked: false, coordinatesCopied: false
        })
    }

    handleWidgetClose = () => {
        // Restore other widgets' highlight settings first so they work normally
        // the moment this widget closes.
        this.restoreSuppression()

        if (this.currentView) {
            try { this.currentView.popupEnabled = true } catch (_) { }

            // Remove only OUR pin, never view.graphics.removeAll().
            if (this.currentPinGraphic) {
                try { this.currentView.graphics.remove(this.currentPinGraphic) } catch (_) { }
                this.currentPinGraphic = null
            }
        }

        this.removeClickListener()
        this.resetState()
    }

    // ── Render ───────────────────────────────────────────────────────────────────
    render() {
        const useMapWidget = this.props.useMapWidgetIds?.[0]
        const { config, theme, id: widgetId } = this.props
        const { clicked, coordinatesCopied, mapViewReady, latitude, longitude, zoom, scale } = this.state

        if (!useMapWidget) {
            return (
                <WidgetPlaceholder
                    icon={squareCrossIcon}
                    autoFlip={true}
                    message={defaultMessages.pleaseSelectMap}
                    widgetId={widgetId}
                />
            )
        }

        const fontFamily = (theme as any)?.ref?.typeface?.fontFamily ?? 'inherit'

        const srOnly: React.CSSProperties = {
            position: 'absolute', width: '1px', height: '1px',
            padding: 0, margin: '-1px', overflow: 'hidden',
            clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0
        }
        const btnStyle = { width: '200px', textAlign: 'center' as const, fontFamily }
        const containerStyle: React.CSSProperties = {
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-start',
            height: '100%', textAlign: 'center', fontFamily
        }
        const btnGroupStyle: React.CSSProperties = {
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '10px', marginBottom: '20px', fontFamily
        }
        const textBoxStyle = { marginBottom: '10px', width: '200px', textAlign: 'center' as const, fontFamily }

        // IDs namespaced by widget instance so multiple copies of the widget
        // on one page don't collide.
        const titleId = `widget-title-${widgetId}`
        const instructionsId = `instructions-${widgetId}`
        const textBoxId = `latLonTextBox-${widgetId}`

        // Coordinate / scale / zoom section.
        const coordSections: React.ReactNode[] = [
            <span key="coords" aria-live="polite">{`${defaultMessages.latLon}: ${latitude}, ${longitude}`}</span>
        ]
        if (config.showZoom) {
            coordSections.push(<span key="zoom" aria-live="polite">{`${defaultMessages.zoom} ${zoom}`}</span>)
        }
        if (config.showScale) {
            coordSections.push(<span key="scale" aria-live="polite">{`${defaultMessages.scale} 1:${scale}`}</span>)
        }
        const coordLine = coordSections.reduce<React.ReactNode[]>((acc, curr, i) =>
            acc.length === 0 ? [curr] : [...acc, ' | ', curr], [])

        // Link-button builder. Returns null when the URL is empty.
        const linkButton = (
            label: string,
            href: string,
            ariaLabel: string,
            tooltipTitle: string,
            btnRef: React.RefObject<HTMLButtonElement>,
            keyName: string
        ) => (
            <Tooltip key={keyName} title={tooltipTitle}>
                <span style={{ display: 'inline-block', width: '100%' }}>
                    <Button
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        type="primary"
                        css={btnStyle}
                        disabled={!clicked}
                        aria-disabled={!clicked ? true : undefined}
                        aria-label={ariaLabel}
                        ref={btnRef}
                    >
                        {label}
                    </Button>
                </span>
            </Tooltip>
        )

        return (
            <div
                className="widget-get-map-coordinates jimu-widget"
                style={{ fontFamily }}
                aria-labelledby={titleId}
                role="region"
            >
                <h2 id={titleId} style={srOnly}>{defaultMessages.ariaWidgetTitle}</h2>

                <JimuMapViewComponent
                    useMapWidgetId={this.props.useMapWidgetIds[0]}
                    onActiveViewChange={this.activeViewChangeHandler}
                />

                <div style={containerStyle}>
                    <p id={instructionsId} role="alert" aria-live="polite" style={{ fontFamily }}>
                        {defaultMessages.clickInstruction}
                    </p>

                    <p aria-live="polite" style={{ fontFamily }}>
                        {mapViewReady ? coordLine : defaultMessages.latLonWillBeHere}
                    </p>

                    <div style={btnGroupStyle} role="toolbar" aria-label={defaultMessages.ariaToolbar}>
                        {config.showPictometry !== false && config.pictometryBaseUrl && linkButton(
                            defaultMessages.pictometryImagery,
                            this.state.Pictometry3dUrl,
                            defaultMessages.ariaPictometry,
                            defaultMessages.tooltipPictometry,
                            this.pictometryBtnRef,
                            'btn-pictometry'
                        )}

                        {config.showGoogleStreetView !== false && linkButton(
                            defaultMessages.googleStreetView,
                            this.state.GoogleStreetViewUrl,
                            defaultMessages.ariaGoogleStreetView,
                            defaultMessages.tooltipGoogleStreetView,
                            this.streetViewBtnRef,
                            'btn-streetview'
                        )}

                        {config.showGoogleMaps3D !== false && linkButton(
                            defaultMessages.googleMaps3D,
                            this.state.GoogleMaps3DUrl,
                            defaultMessages.ariaGoogleMaps3D,
                            defaultMessages.tooltipGoogleMaps3D,
                            this.googleMapsBtnRef,
                            'btn-googlemaps3d'
                        )}

                        {config.showBingSatellite !== false && linkButton(
                            defaultMessages.bingSatelliteMaps,
                            this.state.BingSatelliteUrl,
                            defaultMessages.ariaBingSatellite,
                            defaultMessages.tooltipBingSatellite,
                            this.bingSatelliteBtnRef,
                            'btn-bingsat'
                        )}

                        {config.showBingStreetside !== false && linkButton(
                            defaultMessages.bingStreetside,
                            this.state.BingStreetsideUrl,
                            defaultMessages.ariaBingStreetside,
                            defaultMessages.tooltipBingStreetside,
                            this.bingStreetsideBtnRef,
                            'btn-streetside'
                        )}

                        {config.showCopyButton !== false && (
                            <Tooltip
                                key="btn-copy"
                                title={coordinatesCopied ? defaultMessages.tooltipCopied : defaultMessages.tooltipCopy}
                            >
                                <span style={{ display: 'inline-block', width: '100%' }}>
                                    <Button
                                        type="primary"
                                        onClick={this.copyToClipboard}
                                        css={btnStyle}
                                        disabled={!clicked}
                                        aria-disabled={!clicked ? true : undefined}
                                        aria-label={defaultMessages.ariaCopy}
                                        ref={this.copyBtnRef}
                                    >
                                        {coordinatesCopied ? defaultMessages.copied : defaultMessages.copyLatLon}
                                    </Button>
                                </span>
                            </Tooltip>
                        )}

                        <Tooltip
                            key="textbox"
                            title={clicked ? defaultMessages.tooltipTextBoxAfterClick : defaultMessages.tooltipTextBoxBeforeClick}
                        >
                            <TextInput
                                id={textBoxId}
                                value={clicked ? `${latitude}, ${longitude}` : ''}
                                readOnly
                                css={textBoxStyle}
                                placeholder={clicked ? '' : defaultMessages.textBoxPlaceholder}
                                aria-label={defaultMessages.ariaTextBox}
                                ref={this.textInputRef}
                            />
                        </Tooltip>

                        <p aria-hidden={true} style={{ fontFamily }}>
                            {defaultMessages.copyHint}
                        </p>
                        <p style={srOnly}>
                            {defaultMessages.copyHintSrOnly}
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}
