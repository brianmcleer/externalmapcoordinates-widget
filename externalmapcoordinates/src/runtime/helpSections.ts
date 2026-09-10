import type { HelpSection } from './components/HelpPopup'

/**
 * Flags the widget computes from config and live status. One per feature that has help text.
 * widget.tsx computes these with the same checks the render method uses (for example
 * `config.showPictometry !== false && !!config.pictometryBaseUrl`), so the guide never
 * describes a button the widget is not currently showing.
 */
export interface HelpFeatures {
    /* link buttons */
    pictometry: boolean
    googleStreetView: boolean
    googleMaps3D: boolean
    bingSatellite: boolean
    bingStreetside: boolean
    /* other controls */
    copyButton: boolean
    showZoom: boolean
    showScale: boolean
    /* button names exactly as the interface shows them */
    labels: HelpLabels
}

export interface HelpLabels {
    pictometry: string
    googleStreetView: string
    googleMaps3D: string
    bingSatellite: string
    bingStreetside: string
    copy: string
    copied: string
}

type T = (id: string, values?: Record<string, string>) => string

export function buildHelpSections (t: T, f: HelpFeatures): HelpSection[] {
    const L = f.labels
    const when = (on: boolean, ...ids: string[]): string[] => (on ? ids.map((id: string) => t(id)) : [])
    const listOf = (parts: string[]): string =>
        parts.length <= 1 ? (parts[0] ?? '') : `${parts.slice(0, -1).join(', ')} ${t('helpAnd')} ${parts[parts.length - 1]}`

    /* Enabled link buttons, in the order they appear on screen. */
    const linkNames: string[] = [
        ...(f.pictometry ? [L.pictometry] : []),
        ...(f.googleStreetView ? [L.googleStreetView] : []),
        ...(f.googleMaps3D ? [L.googleMaps3D] : []),
        ...(f.bingSatellite ? [L.bingSatellite] : []),
        ...(f.bingStreetside ? [L.bingStreetside] : [])
    ]
    const anyLink = linkNames.length > 0
    const anyButton = anyLink || f.copyButton

    /* Start here names the first two enabled buttons so the steps match what is on screen. */
    const startButtons = [...linkNames, ...(f.copyButton ? [L.copy] : [])]
    const startA = startButtons[0] ?? ''
    const startB = startButtons[1] ?? ''
    const startExample = startB
        ? t('helpStartExampleTwo', { a: startA, b: startB })
        : (startA ? t('helpStartExampleOne', { a: startA }) : '')

    const sections: HelpSection[] = [
        {
            key: 'start',
            icon: 'play',
            title: t('helpStartTitle'),
            ordered: true,
            body: [
                t('helpStart1'),
                t('helpStart2'),
                anyButton ? t('helpStart3', { example: startExample }) : t('helpStart3NoButtons')
            ]
        }
    ]

    sections.push({
        key: 'read',
        icon: 'pin',
        title: t('helpReadTitle'),
        body: [
            t('helpRead1'),
            t('helpRead2'),
            ...when(f.showZoom, 'helpReadZoom'),
            ...when(f.showScale, 'helpReadScale'),
            ...when(f.showZoom || f.showScale, 'helpReadLive'),
            t('helpRead3')
        ]
    })

    if (anyLink) {
        sections.push({
            key: 'links',
            icon: 'link',
            title: t('helpLinksTitle'),
            intro: t('helpLinksIntro', { links: listOf(linkNames) }),
            body: [
                ...(f.pictometry ? [t('helpLinkPictometry', { name: L.pictometry })] : []),
                ...(f.googleStreetView ? [t('helpLinkGoogleStreetView', { name: L.googleStreetView })] : []),
                ...(f.googleMaps3D ? [t('helpLinkGoogleMaps3D', { name: L.googleMaps3D })] : []),
                ...(f.bingSatellite ? [t('helpLinkBingSatellite', { name: L.bingSatellite })] : []),
                ...(f.bingStreetside ? [t('helpLinkBingStreetside', { name: L.bingStreetside })] : []),
                t('helpLinksGrey'),
                t('helpLinksNewTab')
            ]
        })
    }

    sections.push({
        key: 'copy',
        icon: 'copy-to-clipboard',
        title: t('helpCopyTitle'),
        body: [
            ...(f.copyButton ? [t('helpCopyButton', { copy: L.copy, copied: L.copied })] : []),
            t('helpCopyBox'),
            t('helpCopyFormat')
        ]
    })

    sections.push({
        key: 'trouble',
        icon: 'exclamation-mark-triangle',
        title: t('helpTroubleTitle'),
        body: [
            ...when(anyButton, 'helpTroubleGrey'),
            t('helpTroubleNoPin'),
            t('helpTroubleSpatialReference'),
            ...when(anyLink, 'helpTroubleNoImagery'),
            ...when(f.pictometry, 'helpTroublePictometryLogin'),
            ...(f.copyButton ? [t('helpTroubleCopy', { copy: L.copy })] : []),
            t('helpTroublePopups'),
            t('helpTroubleContact')
        ]
    })

    sections.push({
        key: 'tips',
        icon: 'lightbulb',
        title: t('helpTipsTitle'),
        body: [
            t('helpTips1'),
            t('helpTips2'),
            t('helpTips3')
        ]
    })

    return sections
}
