const fs = require('fs');

// We don't have sharp installed, so we'll just copy the SVG into the png files as a temporary bypass 
// OR we can just remove the PWA icons entirely for now to fix the warning.

// Let's just remove the bad 1x1 placeholder pngs and update the vite config to point to the SVG
