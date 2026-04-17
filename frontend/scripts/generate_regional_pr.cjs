const fs = require('fs');

const regionalPitches = `# Regional PR Pitch Strategy

This is an expanded list of regional news outlets that love "Cost of Living" and "Postcode Lottery" stories. 

### 1. Reach PLC / Manchester Evening News (MEN)
**To:** newsdesk@men-news.co.uk
**Subject:** The Greater Manchester fuel "postcode lottery" exposed by new app

Hi MEN News Desk,
I’ve built a new free tool (pumpprice.live) using the government's live CMA fuel data, and it shows the "postcode lottery" for fuel prices across Greater Manchester is costing locals millions. 

Drivers are being charged significantly different prices for petrol by the exact same supermarkets just a few miles apart depending on which borough they live in. I built pumpprice.live to map out a driver's exact commute and highlight the cheapest station directly on their route so they stop overpaying. Thought MEN readers might find this genuinely useful during the cost of living crisis!

### 2. Birmingham Live
**To:** newsdesk@birminghammail.co.uk
**Subject:** Free app exposes Birmingham's supermarket fuel price lottery

Hi Birmingham Live Team,
With fuel prices fluctuating wildly across the Midlands, I’ve built a free, ad-free tool (pumpprice.live) that uses live government data to find the cheapest petrol and diesel on any commuter route. 

It exposes how much more drivers are paying at motorway services on the M6 compared to supermarkets just 2 minutes down the slip roads. It's completely free to use—thought your readers might appreciate the tip to save a few quid on their commute this week.

### 3. Liverpool Echo
**To:** news@liverpool.com
**Subject:** The free tool saving Merseyside drivers £££s on fuel

Hi Echo News Desk,
The CMA recently forced supermarkets to publish their live fuel prices, but nobody built a tool to let drivers check those prices *along their commute*. 

I built pumpprice.live to solve this. It's an ad-free map tool where Merseyside drivers can enter their start and end postcodes, and it highlights the cheapest supermarket fuel directly on their route. It exposes the massive price gaps between different boroughs in Liverpool. Hope it's a helpful resource for your readers!
`;

fs.writeFileSync('Pumpprice/frontend/scripts/REGIONAL_PR_CAMPAIGN.md', regionalPitches);
console.log("Generated Regional PR Pitch Document.");
