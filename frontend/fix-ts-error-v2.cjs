const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `      let startCoords: [number, number];
      if (startPostcode === 'Current location' && userCoords) {
        startCoords = [userCoords.lng, userCoords.lat];
      } else {
        startCoords = await geocodePostcode(startPostcode);
      }`;

const newBlock = `      let startCoords: [number, number] | null = null;
      if (startPostcode === 'Current location' && userCoords) {
        startCoords = [userCoords.lng, userCoords.lat];
      } else {
        startCoords = await geocodePostcode(startPostcode);
      }`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/App.tsx', code);
console.log('TS error v2 fixed!');
