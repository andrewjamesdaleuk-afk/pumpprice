const fs = require('fs');

// Remove mapbox/maps references from PRD
try {
  let prd = fs.readFileSync('memory/research/smarttank_prd.md', 'utf8');
  prd = prd.replace(/- \*\*Frontend:\*\* React \/ Vite \/ Tailwind CSS \/ Mapbox GL JS \(or similar\)\./g, '- **Frontend:** React / Vite / Tailwind CSS.');
  prd = prd.replace(/2\. \*\*Routing:\*\* App queries a routing engine \(e\.g\., Mapbox\) to draw the optimal driving path\./g, '2. **Routing:** App queries a routing engine to calculate the optimal driving path.');
  prd = prd.replace(/4\. \*\*Display:\*\* The map highlights the route and drops pins for the stations, prominently featuring the cheapest one\./g, '4. **Display:** The UI lists the stations, prominently featuring the cheapest one.');
  prd = prd.replace(/- \*\*Phase 4: Face\.\*\* Frontend UI \(Map, Postcode Search, Navigation\)\./g, '- **Phase 4: Face.** Frontend UI (Postcode Search, Station List, Navigation).');
  fs.writeFileSync('memory/research/smarttank_prd.md', prd);
  console.log('Updated PRD context.');
} catch(e) {
  console.log('PRD not found or error updating:', e.message);
}

