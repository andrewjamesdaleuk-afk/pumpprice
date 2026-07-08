import { config } from "dotenv";
config({ path: "./frontend/.env" });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = "31c5f266-80ff-803c-bd7e-d2d6293ce39c";

const completedTickets = [
    "Schema Update for Multi-Country Support",
    "Expand Geocoding for French Postcodes",
    "Dynamic Currency & Price Formatting",
    "International Branding with Flag Icons",
    "'Now in France' Feature Banner",
    "Implement French Fuel Data Harvester",
    "Data Mapping & Normalization (FR)",
    "Postcode Input Adaptation"
];

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
      
      const isCompleted = completedTickets.some(t => title.includes(t));
      
      if (isCompleted) {
          console.log("Marking as Done:", title);
          const updateRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${NOTION_TOKEN}`,
                  'Notion-Version': '2022-06-28',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  properties: {
                      "Status": {
                          status: { name: "Done" }
                      }
                  }
              })
          });
          if (!updateRes.ok) {
              console.error("Failed to update:", await updateRes.text());
          }
      }
  }
  console.log("Finished updating tickets.");
}
run();
