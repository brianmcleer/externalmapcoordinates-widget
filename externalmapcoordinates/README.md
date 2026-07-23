# External Map Coordinates Widget

An ArcGIS Experience Builder custom widget that displays the latitude/longitude, scale, and zoom of the current map view, with one-click links to external map services (Pictometry, Google Street View, Google Maps 3D, Bing Satellite, Bing Streetside) for the clicked location.

## Features

- Click anywhere on the map to drop a pin and capture coordinates (latitude/longitude, scale, zoom)
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

## Experience Builder 1.21 TypeScript editor setup

This package includes a widget-level `tsconfig.json` plus a self-contained Visual Studio fallback in `src/emotion-jsx-runtime.d.ts`. Both TSX entrypoints reference that declaration file directly, so the JSX fix remains active even when Visual Studio ignores the nearest `tsconfig.json` or only partially follows pnpm symlinks.

The runtime and setting classes also use TypeScript class/interface merging to supply editor-only `props`/`setState` fallbacks. Interfaces emit no JavaScript and do not alter widget behavior.

After replacing an older copy of the widget:

1. Close every Visual Studio window.
2. Confirm this file is present at exactly:

   ```
   client\your-extensions\widgets\externalmapcoordinates\tsconfig.json
   ```

   `manifest.json` must be beside it. There must not be a second nested `externalmapcoordinates` folder.
3. Delete `.vs` folders under both the `client` folder and the widget folder if present.
4. Run `pnpm ci` from the Experience Builder `client` folder.
5. Reopen the full `client` folder in Visual Studio and let the TypeScript language service reload.

A quick installation check: the first line of both `src/runtime/widget.tsx` and `src/setting/setting.tsx` must reference `../emotion-jsx-runtime.d.ts`.

The widget-level configuration uses `noEmit`, so it changes editor analysis only; Experience Builder remains responsible for the runtime build. Do not install `@types/node` merely for the SVG `require`; this package already supplies a local compile-time declaration.

## Configuration

Open the widget settings panel in the builder to configure:

- Pictometry base URL
- Which external link buttons to show (Pictometry, Google Street View, Google Maps 3D, Bing Satellite, Bing Streetside, Copy)
- Whether to show scale and zoom

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
