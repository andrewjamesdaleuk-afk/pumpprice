import dotenv from 'dotenv';
dotenv.config();
import https from 'https';

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

const updates = [
  {
    title: "BE: Implement French Fuel Data Harvester",
    content: "DEVELOPMENT PLAN: Use the Gouv.fr 'Instant XML Feed' (flux-instantane). Implementation MUST use a stream-based XML parser (e.g., sax or xml-stream) to process ~10,000 stations without memory bloat. Target: https://www.prix-carburants.gouv.fr/rubrique/opendata/"
  },
  {
    title: "BE: Automated 24-Hour Data Purge",
    content: "CRITICAL STORAGE POLICY: Implement a strict 24-hour data lifecycle for the 'prices' table. Any individual station price older than 24 hours must be automatically deleted via GitHub Actions/Postgres Cron. NOTE: 'uk_price_history' MUST REMAIN UNTOUCHED as it is our proprietary historical dataset."
  }
];

// Simple script to find and update or add these
async function addOrUpdate(ticket) {
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
  console.log("Updating Notion tickets with XML and Purging strategy...");
  for (const update of updates) {
    await addOrUpdate(update);
    console.log(`Updated/Added: ${update.title}`);
  }
  console.log("Done.");
}

run();
