import { ImmutableObject } from "jimu-core";

export interface Config {
  /** Show the question-mark button that opens the help guide. Undefined means on,
   *  so apps configured before this setting existed keep their help button. */
  showHelp?: boolean
    showScale: boolean;
    showZoom: boolean;
    // Button visibility options
    showPictometry: boolean;
    showGoogleStreetView: boolean;
    showGoogleMaps3D: boolean;
    showBingSatellite: boolean;
    showBingStreetside: boolean;
    showCopyButton: boolean;
    // Configurable Pictometry URL
    pictometryBaseUrl: string;
}

export type IMConfig = ImmutableObject<Config>;
