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
  data.results.forEach(page => {
      const props = page.properties;
      const title = (props.Name?.title[0]?.plain_text || props.Task?.title[0]?.plain_text || "Untitled");
      const status = props.Status?.status?.name || props.Status?.select?.name || "No Status";
      console.log(`- ${title} [${status}]`);
  });
}
run();
