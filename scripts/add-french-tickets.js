import dotenv from 'dotenv';
dotenv.config();
import https from 'https';

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

const tickets = [
  {
    title: "DB: Schema Update for Multi-Country Support",
    content: "Modify the 'stations' table to include a 'country_code' column (VARCHAR(2), default 'GB'). This is foundational for filtering and logic differences between UK (Pence) and France (Euro) data. Update all existing records to 'GB' to ensure data integrity."
  },
  {
    title: "BE: Implement French Fuel Data Harvester",
    content: "Create a new Supabase Edge Function 'harvester-fr' that polls the French Ministry of Economy API (data.economie.gouv.fr). The function must handle the JSON/XML stream, extract station coordinates, addresses, and current prices for Gazole and SP95-E10."
  },
  {
    title: "BE: Data Mapping & Normalization (FR)",
    content: "Write a transformation layer to map French fuel types to our internal schema. 'Gazole' maps to 'B7' and 'SP95-E10' maps to 'E10'. Ensure recorded_at timestamps are converted correctly to UTC for consistent freshness tracking."
  },
  {
    title: "FE: Expand Geocoding for French Postcodes",
    content: "Update the Nominatim search service in 'frontend/src/services/stations.ts'. Change the 'countrycodes' parameter from 'gb' to 'gb,fr'. This allows the search box to geocode 5-digit French numeric postcodes (e.g., 75008) alongside UK ones."
  },
  {
    title: "FE: Cross-Border Route Search Validation",
    content: "Test and refine the 'route-matcher' logic for cross-border trips (e.g., London to Paris). Verify that stations from both countries are returned in a single array when the polyline buffer covers both UK and French territory."
  },
  {
    title: "FE: Dynamic Currency & Price Formatting",
    content: "Create a utility 'formatFuelPrice(price, countryCode)'. If GB, return 'price + p'. If FR, return '€ + (price / 100).toFixed(2)'. Update StationCard.tsx to use this logic so French stations show Euro pricing automatically."
  },
  {
    title: "UI: International Branding with Flag Icons",
    content: "Integrate a flag icon system (e.g., Lucide or SVG sprites). Update the station card header to show a small 🇫🇷 flag next to the brand name if country_code is 'FR'. This provides immediate visual context that the user is looking at international data."
  },
  {
    title: "UI: 'Now in France' Feature Banner",
    content: "Implement a high-visibility, dismissible banner component on the homepage (App.tsx). Copy: 'Euro-Trip Ready! Pumpprice now includes live fuel prices across France.' Use the 'Emerald' theme to match the brand aesthetic."
  },
  {
    title: "UI: Postcode Input Adaptation",
    content: "Adjust regex validation in the search input components. Ensure numeric-only inputs of 5 characters are not flagged as 'Invalid UK Postcode', enabling seamless searching for French cities like Calais (62100)."
  },
  {
    title: "SEO: Programmatic French City Pages",
    content: "Update 'generate_sitemap.cjs' and 'localData.ts' to include major French transit hubs (Calais, Dunkirk, Paris, Lille). Generate optimized meta-titles like 'Cheapest Fuel in Calais - Eurotunnel Savings' to capture high-intent ferry/tunnel traffic."
  }
];

async function addTicket(ticket) {
  const data = JSON.stringify({
    parent: { database_id: DB_ID },
    properties: {
      Task: { title: [{ text: { content: ticket.title } }] },
      Status: { status: { name: 'Not started' } },
      Project: { multi_select: [{ name: 'Pumpprice' }] }
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: ticket.content } }]
        }
      }
    ]
  });

  const options = {
    hostname: 'api.notion.com',
    path: '/v1/pages',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) resolve();
      else reject(`Failed: ${res.statusCode}`);
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("Adding 10 French Connection tickets to Notion...");
  for (const ticket of tickets) {
    try {
      await addTicket(ticket);
      console.log(`Created: ${ticket.title}`);
    } catch (e) {
      console.error(`Error creating ${ticket.title}: ${e}`);
    }
  }
  console.log("Done.");
}

run();
