import { config } from "dotenv";
config({ path: "./frontend/.env" });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = "31c5f266-80ff-803c-bd7e-d2d6293ce39c";

async function run() {
  console.log("Creating Regex Postcode Detection ticket...");
  
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
        "Task": {
          title: [{ text: { content: "UI: Regex-Based Postcode Detection (UK vs FR)" } }]
        },
        "Status": {
          status: { name: "Not started" }
        },
        "Project": {
          multi_select: [{ name: "Pumpprice" }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content: "Implement client-side regex detection to identify UK vs French postcodes instantly as the user types. This will allow the UI to proactively toggle currency symbols and geocoding hints before the search API is even called." } }]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: "UK Pattern: Alphanumeric (e.g. SW1A 1AA)" } }]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: "FR Pattern: 5 digits (e.g. 75001)" } }]
          }
        }
      ]
    })
  });
  
  const data = await res.json();
  if (data.id) {
    console.log("Successfully created ticket! ID:", data.id);
  } else {
    console.error("Failed to create ticket:", data);
  }
}
run();
