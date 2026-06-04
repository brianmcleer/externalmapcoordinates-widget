import { ImmutableObject } from "jimu-core";

export interface Config {
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
