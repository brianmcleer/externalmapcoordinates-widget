/*
  vendor-shims.d.ts  (Visual Studio only, mode B)

  Widget-specific additions to the shared editor shim. exb-editor-shims.d.ts is the copied
  master and stays untouched so it can be compared against the other widgets; anything this
  widget needs beyond it is declared here. Ambient module declarations with the same name
  merge, so this only adds members.

  Do not `import` anything by package name in this file. A file that declares an ambient
  module may import 'react' inside it without TypeScript resolving 'react' on disk, but a
  file that does NOT declare 'react' itself (this one) triggers a real node_modules lookup,
  which on the pnpm install ends in IDE1100 "Access to the path
  client\node_modules\@types\react\index.d.ts is denied". Keep every type here `any`.

  Webpack ignores .d.ts files. Nothing here affects the build or the runtime bundle.
*/

declare module 'jimu-ui' {
    /** Placeholder shown when the widget has no map selected yet. */
    export const WidgetPlaceholder: any
}
