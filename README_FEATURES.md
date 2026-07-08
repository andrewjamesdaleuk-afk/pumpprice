# Pumpprice.live - Feature & Architecture Documentation

## Overview
Pumpprice.live is a real-time, cross-border fuel price monitoring and optimization platform. It helps drivers find the absolute cheapest petrol (E10) and diesel (B7) prices locally or along a planned route, currently supporting both the **UK** and **France**.

---

## 1. Core Data Architecture

### Multi-Country Harvesters
The platform is powered by continuous background data harvesting via Supabase Edge Functions:
*   **UK Harvester:** Integrates directly with the statutory GOV.UK `Fuel Finder` API using OAuth 2.0. It retrieves data in batches, extracting exact pump prices and the precise timestamps of when those prices were physically changed (`recorded_at`).
*   **FR Harvester:** Integrates with the `data.economie.gouv.fr` real-time "Flux instantané v2" API.
*   **Data Normalization:** The French harvester automatically translates French fuel types to match the UK schema (e.g., *Gazole* → B7, *SP95* → E5, *SP98* → SDV) to ensure the UI search logic works seamlessly across borders. Since the French API omits brand names, the harvester intelligently falls back to using the station's City name as the brand identifier.

### Database Schema (PostgreSQL / PostGIS)
*   **Stations Table:** Stores unique `site_id`, `brand`, `postcode`, `country_code`, and a PostGIS `GEOGRAPHY` point for spatial indexing.
*   **Prices Table:** Stores the `station_id`, `fuel_type`, `price` (normalized to Pence or Cents), and the `recorded_at` timestamp.
*   **Orphan/Stale Management:** The platform does *not* blindly purge prices older than 24 hours. Because the new APIs report the exact time of the last *change*, a price from two weeks ago is still legally valid if it hasn't been altered.

---

## 2. Search & Routing Engine

### Geocoding
*   Powered by the **OpenStreetMap (Nominatim) API**.
*   **Cross-Border Support:** The API requests are parameterized with `countrycodes=gb,fr`, allowing users to enter either UK alphanumeric postcodes (e.g., `SW1A 1AA`) or French 5-digit postcodes (e.g., `75001`).

### Route Matching & Spatial Queries
*   **Local Search (Radius):** If the user only enters a start postcode, the app generates a tiny 10-meter "dummy route" and applies a massive geographic buffer (deviation radius) to search a circular area.
*   **Route Search (A to B):** Powered by the **OSRM (Open Source Routing Machine) API**. It calculates the driving polyline between the start and end coordinates.
*   **The PostGIS RPC:** The `get_stations_along_route` database function takes the encoded polyline, draws a geographic buffer around it (default 0.5 miles), and uses `ST_DWithin` to find all stations intersecting that route, returning them sorted by price.
*   **Dynamic Timestamps:** The `route-matcher` Edge Function intercepts the RPC response and merges in the latest `recorded_at` timestamp from the `prices` table.

---

## 3. Frontend Features & UX

### Dynamic Localization
The React frontend (Vite/Tailwind) features intelligent localization based on the station's `country_code`:
*   **Currency Formatting:** UK stations display `£` and `.9p` fractions. French stations dynamically swap to display `€` and cents.
*   **Branding:** Stations are adorned with a localized flag icon (🇬🇧 or 🇫🇷) directly in the search results, making cross-border journeys (like via the Eurotunnel) visually distinct.
*   **Zero-Price Filtering:** The UI strictly filters out any stations that do not carry the specific fuel type requested by the user, preventing phantom stations from appearing at the top of the cheapest lists.

### Insights & Analytics Engine
The `refresh_all_insights` database cron job runs daily/hourly to precompute complex statistics, split cleanly by country (`GB` vs `FR`):
*   **Brand Leaderboard:** Ranks all fuel retailers in the country by average price (minimum 20 stations for UK, 5 for FR).
*   **Cheapest/Most Expensive Cities:** Uses a predefined dictionary of major geographic coordinates to calculate the average fuel price within each city's radius and compares it against the national average.
*   **Premium Fuel Gap:** Calculates the exact price markup between standard (E10/B7) and premium (E5/SDV) fuels for each specific retailer.

### UI Components
*   **Zero-Click Discovery:** Logged-in users can save their home postcode and fuel preference. When they open the app, it bypasses the search screen and instantly loads their local fuel prices.
*   **Government Cut Visualizer:** A dynamic bar chart that calculates exactly how much of a 60L fill-up is going to the retailer versus government Fuel Duty and VAT.
*   **Navigation Bottom Sheet:** Integrates with Apple Maps, Google Maps, and Waze via universal URI schemes (`maps://`, `https://waze.com/ul`) so users can seamlessly navigate to the cheapest station they found.
