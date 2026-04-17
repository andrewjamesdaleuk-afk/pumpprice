import { Client } from "@notionhq/client";
import { config } from "dotenv";
config({ path: "./frontend/.env" });
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = "31c5f266-80ff-803c-bd7e-d2d6293ce39c";
async function search() {
    const response = await notion.databases.query({ database_id: databaseId });
    response.results.forEach(page => {
        const title = page.properties.Name?.title[0]?.plain_text || page.properties.title?.title[0]?.plain_text || "Untitled";
        const status = page.properties.Status?.status?.name || page.properties.Status?.select?.name || "No Status";
        console.log(`- ${title} [${status}]`);
    });
}
search();
