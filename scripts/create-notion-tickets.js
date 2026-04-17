import { config } from "dotenv";
config({ path: "./Pumpprice/frontend/.env" });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = "31c5f266-80ff-803c-bd7e-d2d6293ce39c";

async function createTicket(title) {
  const res = await fetch(`https://api.notion.com/v1/pages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { database_id: DB_ID },
      properties: {
        Task: { // Or Name, let's use the one from previous query
          title: [
            { text: { content: title } }
          ]
        },
        Status: {
          status: { name: 'Not started' }
        }
      }
    })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Error creating ${title}:`, errorText);
  } else {
    console.log(`Created: ${title}`);
  }
}

async function run() {
  await createTicket("[Pumpprice] UK Daily Average: Database Schema (uk_price_history)");
  await createTicket("[Pumpprice] UK Daily Average: Automation & Cron (calculate_daily_uk_averages)");
  await createTicket("[Pumpprice] UK Daily Average: Frontend Integration");
}
run();
