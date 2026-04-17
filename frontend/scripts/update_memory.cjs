const fs = require('fs');

// 1. Update the PRD to remove GOV.UK references and correctly describe the CMA architecture.
try {
  let prd = fs.readFileSync('memory/research/smarttank_prd.md', 'utf8');
  prd = prd.replace(
    /Using the newly mandated GOV.UK Fuel Finder API/g, 
    'Using the CMA Open Data feeds (Tesco, Asda, Sainsbury\'s, etc.)'
  );
  prd = prd.replace(
    /- \*\*Data Pipeline:\*\* Scheduled Edge Function \(Cron\) pulling from GOV.UK Fuel Finder API \(OAuth 2.0\) every 15-30 mins to avoid the strict 30 RPM rate limits and serve data instantly to users./g, 
    '- **Data Pipeline:** Scheduled Edge Function (Cron) pulling directly from CMA Open Data JSON endpoints every 15-30 mins. This populates a Supabase PostGIS database so the frontend can rapidly query stations along a spatial route without hitting external rate limits.'
  );
  prd = prd.replace(
    /- \*\*Phase 2: Engine\.\*\* The Harvester \(GOV\.UK API sync\)\./g,
    '- **Phase 2: Engine.** The Harvester (CMA Open Data JSON sync).'
  );
  fs.writeFileSync('memory/research/smarttank_prd.md', prd);
  console.log('Updated PRD memory.');
} catch(e) {
  console.log('Error updating PRD:', e.message);
}

// 2. Clear out the obsolete 2026-03-12 log that mentions GOV.UK Auth issues
try {
  let log = fs.readFileSync('memory/2026-03-12.md', 'utf8');
  log = log.replace(
    /\*   \*\*GOV\.UK Authentication:.*on the GOV\.UK side\./g,
    '*   **Data Harvester:** Migrated away from the centralized GOV.UK API gateway concept. The harvester now directly pulls from the individual CMA Open Data JSON feeds (Tesco, Asda, etc.) to bypass authentication bottlenecks.'
  );
  log = log.replace(
    /while the GOV\.UK API credentials propagate or are debugged\./g,
    'so the CMA harvester can begin syncing live data.'
  );
  fs.writeFileSync('memory/2026-03-12.md', log);
  console.log('Updated 2026-03-12 log.');
} catch(e) {
  console.log('Error updating 2026-03-12 log:', e.message);
}

// 3. Document today's progress in a new log
const todayLog = `## [2026-03-14] Pumpprice.live Deployment & Pivot
*   **Rebranding:** Project "Pumpprice/Fuelly" has been fully rebranded to **Pumpprice.live**. All frontend copy, headers, and blog posts updated.
*   **Deployment:** Production build deployed via PM2 (port 3005) on the Hostinger VPS. Configured Nginx to act as a reverse proxy, heavily relying on Cloudflare (Full SSL) to handle external traffic routing and encryption.
*   **Data Architecture (Confirmed):** The application relies on the \`harvester\` Supabase Edge Function to pull raw JSON from CMA Open Data endpoints (Asda, Tesco, Sainsbury's, BP, Shell, etc.). This data is stored in the Supabase PostGIS database. The frontend queries the \`route-matcher\` RPC to find stations along the Mapbox polyline.
*   **Current Blocker:** Awaiting the execution of \`schema.sql\` and \`routing-rpc.sql\` on the Supabase database to initialize the spatial tables so the harvester can be run.
`;
fs.writeFileSync('memory/2026-03-14.md', todayLog);
console.log('Created 2026-03-14 memory log.');

