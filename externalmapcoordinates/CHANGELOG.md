# Changelog

Newest first. Every release bumps `manifest.json` and `package.json` together.

## 1.12.4 (2026-09-18)

- Settings: a **Show help guide** option. Turn it off and the question-mark button and the first-run hint both disappear; the guide itself is untouched. Undefined means on, so apps configured before this release keep their help button.

## 1.12.3 (2026-09-18)

- Security: the beacon's session id now falls back to `crypto.getRandomValues` and then to a clock value instead of `Math.random`, which CodeQL flags as insecure randomness (shared beacon 1.1.1). The id only groups one page load's events; it is never a secret or a credential.
- Build: `tsconfig.json` is `jsx: react-jsx` with `jsxImportSource: @emotion/react`, matching the Experience Builder client. ts-loader reads the widget tsconfig, and the previous classic `jsx: react` setting made the settings panel and runtime fail with "Cannot convert undefined or null to object" after a full rebuild. No functional change.

## 1.12.2 (2026-09-18)

- Added: anonymous usage and error telemetry (shared beacon module; off unless the portal publishes an exb-beacon-sink table; telemetry: false in config disables it).

## 1.12.1 (2026-09-17)

- Packaging: the Visual Studio editor shims are no longer in the release zip. `publish.ps1` strips them from a staging copy (`$ReleaseOnlyExclude`) and refuses to zip if any ambient `declare module` of react, jimu or esri survives. The shims stay in the GitHub repo; clone users delete them before building.
- Fixed: Maps SDK 5.x (Experience Builder 1.21) compatibility. The view-level highlight is now hidden and restored through the view.highlights default entry on 5.x (MapView.highlightOptions was removed); 4.x keeps the old path.

## 1.12.0 (2026-09-10)

### Added
- In-widget help guide on the GIS Division's shared pattern: Help button at the top right, searchable accordion guide, and a one-time "New here?" hint. Guide text is gated on the same settings the buttons use, so a hidden button is never described. New files: `src/runtime/theme.ts`, `src/runtime/components/HelpPopup.tsx`, `src/runtime/components/FirstRunHint.tsx`, `src/runtime/helpSections.ts`, and the `help*` / `firstRun*` strings in `src/runtime/translations/default.ts`.
- Zoom and scale now follow the map live as the user zooms in and out (Maps SDK `reactiveUtils.watch`, with `view.watch` as a fallback), instead of updating only when the map is clicked. Clearing the pin with Esc keeps the current zoom and scale.
- `CHANGELOG.md`.

### Changed
- Visual Studio setup moved to the self-contained editor shim (mode B): `tsconfig.json` has no `paths`, uses classic `jsx: "react"` and `"types": []`; `src/exb-editor-shims.d.ts` is the shared master copy; `src/vendor-shims.d.ts` carries this widget's additions. Fixes the Error List flood (`IDE1100 Access to the path ... node_modules ... is denied`, `TS2503 Cannot find namespace '__esri'`, `TS2306 ... is not a module` from `client\jimu-core`, and `TS2882` on the `../index.css` side-effect import).
- Widget open/close detection compares against `WidgetState` from `jimu-core` instead of string literals.
- Pressing Esc while the help guide is open closes the guide only; it no longer also clears the pin.
- `manifest.json` version aligned with `package.json`.

### Removed
- `src/emotion-jsx-runtime.d.ts` and the `/// <reference path>` lines that pointed at it (superseded by the shims above).
