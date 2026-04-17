import { config } from "dotenv";
config({ path: "./frontend/.env" });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

const ideas = [
  {
    title: "[SEO Insight] The 'Airport Rental Car Return' Trap",
    description: "The Concept: People returning rental cars at airports are desperate for a nearby petrol station to avoid extortionate agency refueling fees, and local stations know it.\nThe Data: Use location to find stations within a 3-mile radius of major UK airports. Compare prices to the regional average.\nSEO Angle: 'Cheapest petrol near Heathrow airport', 'Where to fill up before returning rental car Gatwick'.\nContent Idea: Dedicated 'Airport Refueling Guides' for the top 10 UK airports."
  },
  {
    title: "[SEO Insight] The 'Proximity Discount' (The Supermarket Halo Effect)",
    description: "The Concept: Do expensive brands (like BP or Shell) magically drop their prices if they happen to be located next door to an Asda or Tesco?\nThe Data: Geospatial query checking the price of premium brand stations based on distance to the nearest supermarket station.\nSEO Angle: 'Does living near an Asda make your fuel cheaper?'\nPR Angle: 'The Supermarket Halo Effect: How living within 1 mile of a Tesco saves you £50 a year on fuel.'"
  },
  {
    title: "[SEO Insight] The 'Diesel Penalty' Tracker",
    description: "The Concept: The price gap between petrol and diesel fluctuates wildly. Some brands and regions aggressively mark up diesel.\nThe Data: Calculate the spread between petrol and diesel prices at individual stations. Find the stations/brands with the widest gaps.\nSEO Angle: 'Petrol vs Diesel prices UK', 'Cheapest supermarket for diesel'.\nContent Idea: A live 'Diesel Gap' index page."
  },
  {
    title: "[SEO Insight] The 'Speed of Drop' Leaderboard",
    description: "The Concept: When wholesale oil prices drop, which brand passes the savings onto the consumer first, and who drags their feet?\nThe Data: Analyze uk_price_history and individual prices.recorded_at during a known national price drop. Track days to reflect the new petrol_low.\nSEO Angle: 'Which supermarket drops fuel prices fastest?'\nContent Idea: 'The Greed Index': A live ranking of brands."
  },
  {
    title: "[SEO Insight] The A-Road vs. Motorway Debate",
    description: "The Concept: Motorway services are expensive, but are major A-roads (A1, A14, A303) just as bad?\nThe Data: Filter stations with address containing major A-roads and compare their prices to motorway_services data.\nSEO Angle: 'A1 petrol prices', 'Are A-road services cheaper than motorways?'\nContent Idea: A road-trip hack guide for Bank Holidays."
  },
  {
    title: "[SEO Insight] The 'Coastal / Holiday Tax'",
    description: "The Concept: Do petrol stations in popular seaside/tourist towns quietly hike their prices during the summer holidays?\nThe Data: Track the price delta in coastal postcodes vs the national average during July/August vs November/February.\nSEO Angle: 'Are petrol prices higher in tourist areas?', 'Cornwall petrol prices'.\nPR Angle: Exposing the 'Holiday Tourist Tax'."
  },
  {
    title: "[SEO Insight] Independents vs. The Big Oil Cartel",
    description: "The Concept: How do smaller independent brands stack up against the giants?\nThe Data: Group average prices by brand, excluding supermarkets, and pit the Indies against Big Oil.\nSEO Angle: 'Are independent petrol stations cheaper'.\nContent Idea: A spotlight page helping people support local garages beating the big boys."
  },
  {
    title: "[SEO Insight] The 'Price Volatility' Heatmap",
    description: "The Concept: Where are the UK's most volatile fuel markets? Some towns have daily price wars, others are static.\nThe Data: Count the frequency of new recorded_at entries with a different price for stations over a 30-day period. Group by city/county.\nSEO Angle: 'Petrol price wars UK', 'Why do petrol prices change daily?'\nContent Idea: An interactive 'Fuel War Heatmap'."
  },
  {
    title: "[SEO Insight] The Regional Border Divide",
    description: "The Concept: A macro-level comparison of the constituent countries of the UK. Is fuel fundamentally cheaper over the border?\nThe Data: Map postcodes to their respective nations and generate rolling 30-day averages.\nSEO Angle: 'Petrol prices Scotland vs England'.\nContent Idea: A live 'National Average Dashboard' breaking down the UK average into its 4 countries."
  },
  {
    title: "[SEO Insight] The 'Ghost Town' Monopoly Penalty",
    description: "The Concept: How much more do you pay if your town only has one petrol station within a 5-mile radius?\nThe Data: Density query to find isolated stations. Compare prices to stations in high-density clusters.\nSEO Angle: 'Why is my local petrol station so expensive', 'Monopoly petrol prices'.\nPR Angle: 'The Monopoly Tax: Towns with only one petrol station pay £120 more per year'."
  }
];

async function createTicket(idea) {
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
        Task: { // Used in previous script
          title: [
            { text: { content: idea.title } }
          ]
        },
        Status: {
          status: { name: 'Not started' }
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { content: idea.description }
              }
            ]
          }
        }
      ]
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Error creating ${idea.title}:`, errorText);
  } else {
    console.log(`Created Notion Task: ${idea.title}`);
  }
}

async function run() {
  console.log("Adding 10 SEO Insight ideas to Notion...");
  for (const idea of ideas) {
    await createTicket(idea);
  }
  console.log("Done.");
}

run();