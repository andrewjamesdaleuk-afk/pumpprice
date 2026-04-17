const fs = require('fs');

let main = fs.readFileSync('Pumpprice/frontend/src/main.tsx', 'utf8');

if (!main.includes("import Privacy")) {
  main = main.replace(
    "import LocationsIndex from './pages/LocationsIndex.tsx'",
    "import LocationsIndex from './pages/LocationsIndex.tsx'\nimport Privacy from './pages/Privacy.tsx'"
  );
  
  main = main.replace(
    '<Route path="/locations" element={<LocationsIndex />} />',
    '<Route path="/locations" element={<LocationsIndex />} />\n        <Route path="/privacy" element={<Privacy />} />'
  );
  
  fs.writeFileSync('Pumpprice/frontend/src/main.tsx', main);
  console.log("Added Privacy route to main.tsx");
} else {
  console.log("Privacy route already exists.");
}

