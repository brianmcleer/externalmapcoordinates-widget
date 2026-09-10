export default {
    _widgetLabel: "External Map Coordinates",

    // Coordinate display
    latLon: "Lat/Lon",
    zoom: "Zoom",
    scale: "Scale",
    latLonWillBeHere: "Lat/Long (None - please hover or click on the map.)",

    // Instructions
    clickInstruction: "Click on the location of interest on the map and then choose a button below.",
    copyHint: "Use ctrl+c or right-click to copy to the clipboard.",
    copyHintSrOnly: "Use the Copy Lat/Lon button above or press Control+C to copy the coordinates.",

    // Button labels
    pictometryImagery: "Pictometry Imagery",
    googleStreetView: "Google Street View",
    googleMaps3D: "Google Maps 3D",
    bingSatelliteMaps: "Bing Satellite Maps",
    bingStreetside: "Bing Streetside",
    copyLatLon: "Copy Lat/Lon",
    copied: "Copied!",

    // Tooltips
    tooltipPictometry: "View aerial imagery from Pictometry (opens in new window)",
    tooltipGoogleStreetView: "View location in Google Street View (opens in new window)",
    tooltipGoogleMaps3D: "View location in Google Maps 3D (opens in new window)",
    tooltipBingSatellite: "View location in Bing Satellite Maps (opens in new window)",
    tooltipBingStreetside: "View location in Bing Streetside (opens in new window)",
    tooltipCopy: "Copy coordinates to clipboard",
    tooltipCopied: "Coordinates copied!",
    tooltipTextBoxBeforeClick: "Click on the map to get coordinates",
    tooltipTextBoxAfterClick: "Coordinates for selected location",

    // Aria labels
    ariaPictometry: "View location in Pictometry imagery (opens in new window)",
    ariaGoogleStreetView: "View location in Google Street View (opens in new window)",
    ariaGoogleMaps3D: "View location in Google Maps 3D (opens in new window)",
    ariaBingSatellite: "View location in Bing Satellite Maps (opens in new window)",
    ariaBingStreetside: "View location in Bing Streetside (opens in new window)",
    ariaCopy: "Copy coordinates to clipboard",
    ariaTextBox: "Latitude and Longitude coordinates",
    ariaWidgetTitle: "Map Coordinates and Image Links",
    ariaToolbar: "Location options",

    // Placeholder
    textBoxPlaceholder: "Click map to set coordinates",

    // Screen reader announcements
    srPinPlaced: "Pin placed at latitude {lat}, longitude {lon}",
    srCopied: "Coordinates copied to clipboard",
    srUnsupportedSr: "This map uses spatial reference {wkid} which the widget cannot convert. Please use a Web Mercator or WGS84 basemap.",

    // Placeholder
    pleaseSelectMap: "Please select a map.",

    // Setting panel
    selectMapWidget: "Select a Map",
    settings: "Settings",
    showZoom: "Show Zoom",
    showScale: "Show Scale",

    buttonVisibilityLabel: "Button Visibility",
    showPictometry: "Show Pictometry Button",
    showGoogleStreetView: "Show Google Street View Button",
    showGoogleMaps3D: "Show Google Maps 3D Button",
    showBingSatellite: "Show Bing Satellite Button",
    showBingStreetside: "Show Bing Streetside Button",
    showCopyButton: "Show Copy Coordinates Button",

    pictometryConfiguration: "Pictometry Configuration",
    pictometryBaseUrl: "Pictometry Base URL",
    pictometryUrlHint: "Enter the full URL including .aspx file",
    pictometryUrlPlaceholder: "https://www.your-server.com/pictometry/viewer.aspx",

    /*
      In-widget help guide. Keys follow the shared pattern used by the GIS Division's other
      widgets (WIDGETHANDOFF Section 10). {tokens} in braces are filled in by helpSections.ts
      with the button names as the interface shows them.
    */

    /* Shared keys: same names and wording in every widget */
    helpTitle: "Help",
    close: "Close",
    helpIntro: "Find the latitude and longitude of any spot on the map, then jump to outside imagery of that spot.",
    helpSearchPlaceholder: "Search the guide (try \"copy\" or \"pin\")",
    helpNoMatches: "Nothing in the guide matches that word. Try another, or open the sections above.",
    helpAnd: "and",
    firstRunTitle: "New here?",
    firstRunBody: "Click a spot on the map, read its coordinates at the top, then pick a button to see that spot in another map service.",
    firstRunHelpLink: "Open the guide.",
    firstRunDismiss: "Dismiss",

    /* Start here */
    helpStartTitle: "Start here: three steps",
    helpStart1: "Click the spot on the map you want to look at. An orange pin marks it.",
    helpStart2: "Read the latitude and longitude at the top of the widget. They update every time you click.",
    helpStart3: "Click one of the buttons below the coordinates{example}. Outside services open in a new browser tab.",
    helpStart3NoButtons: "The coordinates also appear in the box below. Click in it and press Ctrl+C to copy them.",
    helpStartExampleOne: ", such as {a}",
    helpStartExampleTwo: ", such as {a} or {b}",

    /* Reading the numbers */
    helpReadTitle: "Reading the numbers",
    helpRead1: "Latitude comes first, then longitude, both in decimal degrees with eight decimal places.",
    helpRead2: "A negative longitude means west of Greenwich. A negative latitude means south of the equator.",
    helpReadZoom: "Zoom is the map's zoom level. A bigger number means the map is zoomed in closer.",
    helpReadScale: "Scale is written as 1 to a number, for example 1:2400. A smaller number means the map is zoomed in closer.",
    helpReadLive: "Zoom and scale follow the map. They change as you zoom in or out, even before you click.",
    helpRead3: "The numbers describe the spot you clicked, not the center of the map.",

    /* The link buttons */
    helpLinksTitle: "The buttons, one by one",
    helpLinksIntro: "Each button opens the pinned spot in another website: {links}.",
    helpLinkPictometry: "{name}: aerial photos taken at an angle, so you can see the sides of buildings. Uses your organization's Pictometry viewer.",
    helpLinkGoogleStreetView: "{name}: photos taken from the street, as if you were standing there.",
    helpLinkGoogleMaps3D: "{name}: a satellite view tilted so buildings and terrain show in 3D.",
    helpLinkBingSatellite: "{name}: a straight-down satellite view from Microsoft Bing.",
    helpLinkBingStreetside: "{name}: Microsoft's street-level photos, similar to Street View.",
    helpLinksGrey: "The buttons are grey until you click the map. Once a pin is placed they turn blue and can be clicked.",
    helpLinksNewTab: "Every button opens a new browser tab, so this map stays where it is. Close the tab to come back.",

    /* Copying */
    helpCopyTitle: "Copying the coordinates",
    helpCopyButton: "Click {copy} to copy the coordinates. The button says {copied} for a moment to confirm.",
    helpCopyBox: "Click in the box below the buttons and press Ctrl+C to copy what is in it.",
    helpCopyFormat: "The copied text looks like 39.06388889, -108.55083333, ready to paste into a search box or an email.",

    /* Troubleshooting */
    helpTroubleTitle: "If something looks wrong",
    helpTroubleGrey: "The buttons stay grey: you have not clicked the map yet. Click a spot on the map first.",
    helpTroubleNoPin: "Nothing happens when you click the map: the widget is not connected to a map. Ask whoever built this app to check the map setting.",
    helpTroubleSpatialReference: "A message says the map's spatial reference cannot be converted: this widget reads Web Mercator, WGS84, UTM and Colorado State Plane maps. Ask whoever built this app about the map's coordinate system.",
    helpTroubleNoImagery: "A button opens a page with no picture: that website has no imagery for that spot. Try a spot nearby, or a different button.",
    helpTroublePictometryLogin: "Pictometry asks you to sign in: the Pictometry viewer needs its own account. Ask whoever built this app if you should have one.",
    helpTroubleCopy: "{copy} does nothing: your browser blocked clipboard access. Click in the box below the buttons and press Ctrl+C instead.",
    helpTroublePopups: "Map popups stopped appearing: they are paused while this widget is open so your click places a pin instead. Close the widget to get them back.",
    helpTroubleContact: "Still stuck? Contact the GIS Division and mention the External Map Coordinates name and this app.",

    /* Tips */
    helpTipsTitle: "Good to know",
    helpTips1: "Press Esc to clear the pin and start over.",
    helpTips2: "Click a new spot at any time. The pin and the coordinates move to the new spot.",
    helpTips3: "The pin disappears when you close the widget. Copy the coordinates first if you need to keep them."
};
