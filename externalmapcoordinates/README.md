# External Map Coordinates Widget

An ArcGIS Experience Builder custom widget that displays the latitude/longitude, scale, and zoom of the current map view, with one-click links to external map services (Pictometry, Google Street View, Google Maps 3D, Bing Satellite, Bing Streetside) for the clicked location.

## Features

- Click anywhere on the map to drop a pin and capture coordinates (latitude/longitude, scale, zoom)
- Scale and zoom update live as the map zooms in and out
- Type or paste coordinates manually to zoom to a location
- One-click links to:
  - Pictometry (with configurable base URL for organizations on a custom deployment)
  - Google Street View
  - Google Maps 3D
  - Bing Satellite
  - Bing Streetside
- Per-button visibility toggles in the settings panel
- Copy coordinates to clipboard
- Suppresses default popups and feature highlights from other widgets while open, restores them on close
- Built-in help guide: a Help button at the top right opens a short, searchable guide written in plain language. The guide only describes the buttons the app has turned on. A one-time "New here?" hint points new users to it.

## Requirements

- ArcGIS Experience Builder Developer Edition **1.21**
- Dependencies installed from the Experience Builder `client` folder with **pnpm**

## Install

1. Download the release zip and extract it.
2. Place the `externalmapcoordinates` folder directly inside your Experience Builder client extensions folder:

   ```
   client\your-extensions\widgets\externalmapcoordinates\
   ```

   `manifest.json` must sit **directly inside** that folder. Do not nest it a second level deep (for example `widgets\externalmapcoordinates\externalmapcoordinates\`). Nesting is the most common cause of a widget not registering.
3. From the Experience Builder `client` folder, install dependencies:

   ```
   pnpm ci
   ```

   Do not run `npm install` inside the widget folder on Experience Builder 1.21.
4. Start (or restart) Experience Builder:

   ```
   pnpm start
   ```
5. The widget appears in the builder under **Custom**.

## Experience Builder 1.21 TypeScript editor setup (Visual Studio)

Experience Builder 1.21 installs the `client` folder with pnpm. Visual Studio cannot read through the pnpm junctions under `client\node_modules` (the Error List shows `IDE1100 "Access to the path ... is denied"`), so its TypeScript service has no types for React, jimu or the Maps SDK and reports hundreds of errors that the webpack build does not have.

This package ships the GIS Division's standard fix. It is editor-only (`noEmit`) and changes nothing about the build or the runtime bundle; webpack (`pnpm start` in `client`) remains the only type authority.

- `tsconfig.json` next to `manifest.json`: no `baseUrl` or `paths`, `"types": []`, classic `"jsx": "react"`. Visual Studio never opens `node_modules` or `client\jimu-core`.
- `src/exb-editor-shims.d.ts`: every module the widget imports (`react`, `jimu-core`, `jimu-arcgis`, `jimu-ui`, `jimu-theme`, `calcite-components`, `esri/*`, `*.css`, `*.svg`) declared ambiently, plus a global `JSX` namespace so classic JSX type-checks. This file is a copy of the shared master and is identical across the GIS Division's widgets.
- `src/vendor-shims.d.ts`: the few additions this widget needs beyond the master (`WidgetPlaceholder`).

After replacing an older copy of the widget:

1. Close every Visual Studio window.
2. Delete the old `src/emotion-jsx-runtime.d.ts` if it is still present. It is superseded by the two shim files above.
3. Delete the `.vs` folder inside the widget folder if present.
4. Open the widget folder in Visual Studio (`File > Open > Folder` on `client\your-extensions\widgets\externalmapcoordinates`), not the `client` folder or the Experience Builder root.
5. In the Error List, set the scope to **Open Documents**. Errors whose File column is under `client\jimu-core` or `client\node_modules` are Esri's, appear only when one of those files is open in a tab, and are not actionable.

Quick check: in the widget folder, `npx tsc -p .` reports 0 errors (TypeScript 5.6). If `F12` on `PureComponent` lands in `jimu-core` or `node_modules` rather than `src/exb-editor-shims.d.ts`, the widget `tsconfig.json` is not the one in effect.

## Configuration

Open the widget settings panel in the builder to configure:

- Pictometry base URL
- Which external link buttons to show (Pictometry, Google Street View, Google Maps 3D, Bing Satellite, Bing Streetside, Copy)
- Whether to show scale and zoom

The help guide reads the same settings, so a button that is turned off is not mentioned in the guide.

## Feedback

- Issues and feature requests: <https://github.com/brianmcleer/externalmapcoordinates-widget/issues>
- Esri Community discussion: see the post linked from the repository's README

## Troubleshooting: `externalmapcoordinates is duplicated`

Experience Builder registers widgets by the `name` value in `manifest.json` and throws this error when the same name is registered more than once. A correctly placed single copy cannot duplicate itself, so a second copy is present somewhere.

Check in this order:

1. **Nested folder**: `widgets\externalmapcoordinates\externalmapcoordinates\`. The manifest must sit directly inside the widget folder, not a second level deep. This is the usual cause when a zip is extracted into a folder that already has the widget's name.
2. **Leftover folder** from an earlier build or version, including any `-copy` folder, or a folder under the widget's previous name if it was renamed.
3. **Stale compiled build** in `client\dist\widgets\externalmapcoordinates\`. Stop the dev server, delete that folder, then start again. This is the common cause after moving a widget between EB versions.

## License

Apache License 2.0. Copyright City of Grand Junction, CO. See [LICENSE](./LICENSE).

## Credits

Originally based on the ArcGIS for Developers Experience Builder coordinates tutorial. Subsequent work by EsriAU (Frederic Poliart), David Das (Maricopa County), and Brian McLeer (City of Grand Junction).
