const fs = require('fs');
const file = 'GEMINI.md';
let content = fs.readFileSync(file, 'utf8');

const newNotes = `

## 🚀 Latest Features (March 31, 2026)
- **Stale Data Penalty**: Added business logic to identify and penalize stations whose \`recorded_at\` timestamp from the CMA API is older than **24 hours**. These stations are pushed to the bottom of search results under a "Stale Data" header, and their exact prices and navigation buttons are completely hidden to protect driver trust.
- **GPS "Use My Location"**: Integrated the browser Geolocation API into the search box. Tapping the new crosshair icon captures raw GPS coordinates and bypasses the Nominatim geocoding API entirely, offering faster and more accurate local searches. The UI state ("Current location") dynamically syncs colors (Emerald/Sky) based on the active fuel type.
- **Low-Friction Accounts & Personalization**: Implemented a global \`AuthContext\` via Supabase. Users can sign up instantly (email verification disabled) and are routed straight to a new \`/account\` page to set a default local postcode and fuel preference. Logged-in users experience "Zero-Click Discovery", as the homepage automatically loads their Local Search preferences immediately.
`;

content += newNotes;
fs.writeFileSync(file, content);
console.log('Project notes updated successfully.');
