const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The error is because geocodePostcode returns [number, number] | null but we defined startCoords as let startCoords;
// We should cast it to [number, number] or type it correctly.

code = code.replace(
  'let startCoords;',
  'let startCoords: [number, number];'
);

fs.writeFileSync('src/App.tsx', code);
console.log('TS error fixed!');
