import { config } from "dotenv";
config({ path: "./frontend/.env" });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = "31c5f266-80ff-803c-bd7e-d2d6293ce39c";

async function run() {
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  
  for (const page of data.results) {
      const props = page.properties;
      const title = (props.Name?.title[0]?.plain_text || props.Task?.title[0]?.plain_text || "Untitled");
      const pageId = page.id;
      
      if (title.includes("Automated 24-Hour Data Purge")) {
          console.log("Archiving (Canceling):", title);
          await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${NOTION_TOKEN}`,
                  'Notion-Version': '2022-06-28',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ archived: true })
          });
      }
      
      if (title.includes("Dynamic Currency & Price Formatting")) {
          console.log("Appending note to:", title);
          await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${NOTION_TOKEN}`,
                  'Notion-Version': '2022-06-28',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  children: [{
                      object: 'paragraph',
                      paragraph: {
                          rich_text: [{ text: { content: "UPDATE: We must retain the '.9' fractional pricing display (as that is how fuel stations globally show prices). Ensure the logic dynamically switches between £/p and €/c based on the station's country code, while keeping the fractional styling intact." } }]
                      }
                  }]
              })
          });
      }
      
      if (title.includes("Expand Geocoding for French Postcodes")) {
          console.log("Appending note to:", title);
          await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${NOTION_TOKEN}`,
                  'Notion-Version': '2022-06-28',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  children: [{
                      object: 'paragraph',
                      paragraph: {
                          rich_text: [{ text: { content: "UPDATE: Update Nominatim API calls to include `countrycodes=gb,fr`. Ensure the UI and routing logic can gracefully handle cross-border routes (e.g. from Kent to Calais)." } }]
                      }
                  }]
              })
          });
      }

      if (title.includes("Schema Update for Multi-Country Support")) {
          console.log("Appending note to:", title);
          await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${NOTION_TOKEN}`,
                  'Notion-Version': '2022-06-28',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  children: [{
                      object: 'paragraph',
                      paragraph: {
                          rich_text: [{ text: { content: "UPDATE: Add a `country` column to the `stations` table. We need to handle French fuel types (SP95, SP98, Gazole, E85). The Insights engine and `calculate_daily_uk_averages` RPC must be refactored or duplicated to calculate French national averages separately from UK averages." } }]
                      }
                  }]
              })
          });
      }
  }
  console.log("Done updating Notion!");
}
run();
