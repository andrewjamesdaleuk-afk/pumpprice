# Pumpprice.live Project Context

## Project Overview
**Pumpprice.live** is a comprehensive fuel price monitoring and optimization platform for UK drivers. Its primary goal is to help users find the cheapest petrol (E10) and diesel (B7) prices, either near their current location or along a planned travel route. It aggregates data from the Competition and Markets Authority (CMA) Open Data scheme and provides advanced analytics, such as brand leaderboards, "supermarket sweeps," and historical price trends.

### Tech Stack & Architecture
- **Frontend**: React 19 (TypeScript) built with Vite. Styling is handled via Tailwind CSS. Maps and routing utilize Mapbox GL/Leaflet and `@mapbox/polyline`. Data visualization is powered by Recharts.
- **Backend**: Supabase (PostgreSQL). Heavily utilizes the **PostGIS** extension for spatial queries (e.g., finding stations within a buffer radius of a polyline route).
- **Serverless/Edge Logic**: Supabase Edge Functions (Deno/TypeScript) execute compute-intensive tasks, notably the `harvester` (automated fuel price data ingestion from CMA APIs) and the `route-matcher`.
- **APIs**: Integrates with OpenStreetMap (Nominatim) for geocoding postcodes and OSRM/Mapbox for polyline decoding and routing.

## 🚀 Streamlined Workflow
We have centralized all project management tools into the root directory to make development, QA, and deployment as smooth as possible.

### Commands:
- **`npm install`**: Installs root and frontend dependencies.
- **`npm run dev`**: Starts the local dev server (Vite) and Ngrok tunnel via PM2.
- **`npm run prod`**: Starts the production preview server (Vite Preview) and Cloudflare tunnel via PM2.
- **`npm run deploy`**: **The Master Deployment Command.** It cleans up ports, builds the frontend, and restarts the production PM2 processes with a health check.
- **`npm run status`**: Shows the status of all PM2 processes.
- **`npm run logs`**: View real-time logs for all processes.
- **`npm run stop`**: Stop all project-related processes.

## 📁 Infrastructure & PM2 Management
All processes are now managed by `ecosystem.config.cjs` in the root.
- **`pumpprice-ui`**: Port 3005 (Production Build Preview).
- **`pumpprice-tunnel`**: Cloudflare Tunnel to `pumpprice.live`.
- **`pumpprice-vite`**: Port 5173 (Dev Server).
- **`pumpprice-ngrok`**: Dev Tunnel to Port 5173.

## 🛠 Troubleshooting
- **Port Collision (Error 1033)**: Fixed by `npm run deploy`, which kills any process on port 3005 before starting.
- **Site Down?**: Check `npm run status`. Ensure `pumpprice-ui` and `pumpprice-tunnel` are both `online`.
- **Logs**: Use `npm run logs` to diagnose issues.

## Development Conventions & File Structure
- **UI Aesthetics**: The application follows a dark-themed, mobile-first, "card-based" aesthetic utilizing Slate, Emerald, and Sky Tailwind color palettes.
- **Layout Constraint**: All main UI cards, forms, and content blocks MUST be constrained to a standard mobile-first width using `max-w-md mx-auto` to ensure consistency with the homepage layout. No full-width sprawling elements.
- **SEO & Meta Tags**: The project uses `react-helmet-async` to dynamically inject tags. Every public-facing page component must utilize the `<Helmet>` wrapper.
- **Sitemap Generation**: Run `npm run sitemap` (or `node generate-sitemap.js`) after adding new locations to update `public/sitemap.xml`.
- **Database Schema**: Defined in `schema.sql`. It centers around `stations` and a massive `prices` table. `get_stations_along_route` is a critical RPC function.
- **Production Safety**: Always verify UI changes on the local dev server (`npm run dev`) before running a production build (`npm run deploy`).

## 🧹 Recent Project Cleanup (March 2026)
- **Rebranding & Folder Rename**: The project was completely renamed from "SmartTank" and "Fuelly" to **Pumpprice**. The root directory is now `/docker/openclaw-r4li/data/.openclaw/workspace/Pumpprice`.
- **Centralized Tooling**: Added a root `package.json` and PM2 `ecosystem.config.cjs` to consolidate deployment and running. Replaced all raw `pm2`/`cloudflared` commands with `npm run deploy`, `npm run dev`, and `npm run prod`.
- **Infrastructure Fixes**: Managed the `cloudflared` tunnel securely via PM2 (`pumpprice-tunnel`). Solved Cloudflare Error 1033 (port collisions) by force-clearing port 3005 within `scripts/deploy.js` before restarting PM2.
- **Frontend Fixes**: Added the `ngrok-skip-browser-warning` header to `services/projection.ts` to fix the local Futures Market component failing to fetch JSON over Ngrok, and updated `PriceProjectionCard.tsx` to dynamically calculate sentiment instead of hardcoding it.


## 🚀 Latest Features (March 31, 2026)
- **Stale Data Penalty**: Added business logic to identify and penalize stations whose `recorded_at` timestamp from the CMA API is older than **24 hours**. These stations are pushed to the bottom of search results under a "Stale Data" header, and their exact prices and navigation buttons are completely hidden to protect driver trust.
- **GPS "Use My Location"**: Integrated the browser Geolocation API into the search box. Tapping the new crosshair icon captures raw GPS coordinates and bypasses the Nominatim geocoding API entirely, offering faster and more accurate local searches. The UI state ("Current location") dynamically syncs colors (Emerald/Sky) based on the active fuel type.
- **Low-Friction Accounts & Personalization**: Implemented a global `AuthContext` via Supabase. Users can sign up instantly (email verification disabled) and are routed straight to a new `/account` page to set a default local postcode and fuel preference. Logged-in users experience "Zero-Click Discovery", as the homepage automatically loads their Local Search preferences immediately.
