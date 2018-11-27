# EF 3D Map

Created in 2012 for EF to embed in their YouTube channel as a client side only app using Three.js - also had a fallback to a 2D map on touch devices since those devices did not support WebGL at the time.

Has not touched the code since 2012 - Line breaks, other white space and encoding seems to have become messed up for some reason, but it is more interesting to see the code as it were rather than cleaning it up before upload, so I leave it as it is.

**Files:**
- index.htm - Example of how it could look embedded in YouTube
- frame.htm - The actual map entry point
- data.xml - The datasource for the map, groups are the locations on the map and videos are the videos that you wish to see when you click a pin
- /js/src/ - Contains the javascript source (including some vendored libs)

**To get started with development**
- Access a local web server serving the folder
