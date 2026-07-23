/**
 * Visual Studio / pnpm JSX fallback for Experience Builder 1.21.
 *
 * Type-only: this file emits no JavaScript and does not replace the real React
 * or Emotion runtime used by Experience Builder's webpack build.
 */
declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any
  }
}

declare module '@emotion/react/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}

declare module '@emotion/react/jsx-dev-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}
