# External Map Coordinates Widget for ArcGIS Experience Builder

A custom widget for ArcGIS Experience Builder Developer Edition 1.20. Displays the latitude/longitude, scale, and zoom of the current map view, and provides one-click links to external map services (Pictometry, Google Street View, Google Maps 3D, Bing Satellite, Bing Streetside) for the clicked location.

See the [widget README](./externalmapcoordinates/README.md) for installation, features, and troubleshooting.

## Repository layout

```
externalmapcoordinates-widget/
├── README.md                       (this file: GitHub landing page)
├── LICENSE                         (Apache-2.0)
├── .gitignore
├── publish.ps1                     (automation: sync widget from EB, commit, push, release)
└── externalmapcoordinates/         (the widget itself, drops into your-extensions/widgets/)
    ├── manifest.json
    ├── package.json
    ├── package-lock.json
    ├── config.json
    ├── icon.svg
    ├── README.md
    ├── LICENSE
    ├── .gitignore
    ├── .npmignore
    └── src/ ...
```

## Releases

Pre-built downloadable zips are published as [GitHub Releases](https://github.com/brianmcleer/externalmapcoordinates-widget/releases). Each release zip contains the `externalmapcoordinates/` folder ready to drop into `client\your-extensions\widgets\`.

## Publishing updates (maintainer notes)

After changes have been made in the live EB folder at `C:\arcgis-experience-builder-1.20\client\your-extensions\widgets\externalmapcoordinates\`, from a terminal opened in this repo folder:

- Code update only:

  ```
  powershell -ExecutionPolicy Bypass -File .\publish.ps1
  ```

- Code update plus a new tagged release:

  ```
  powershell -ExecutionPolicy Bypass -File .\publish.ps1 -Release v1.1.0
  ```

`publish.ps1` performs a `robocopy /MIR` from the EB folder into the `externalmapcoordinates/` subfolder here (skipping `node_modules` and `.vs`), commits, pushes, and on `-Release` cuts a versioned GitHub Release with a zip attached.

### Version tag rules

Tags must increase and never repeat (GitHub rejects duplicates).

- Bug fix: `v1.0.1`, `v1.0.2`
- New feature: `v1.1.0`, `v1.2.0`
- Major change: `v2.0.0`

## Esri Community

Post and discussion: (link goes here after the community post is created)

## Credits

Originally based on the ArcGIS for Developers Experience Builder coordinates tutorial. Subsequent work by EsriAU (Frederic Poliart), David Das (Maricopa County), and Brian McLeer (City of Grand Junction).

## License

Apache-2.0. Copyright City of Grand Junction, CO. See [LICENSE](./LICENSE).
