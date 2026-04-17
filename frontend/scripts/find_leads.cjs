const https = require('https');

const subreddits = ['CarTalkUK', 'drivingUK', 'UKPersonalFinance', 'deliveroos'];
const keywords = ['petrol', 'diesel', 'fuel', 'pump', 'cost of living', 'expensive'];

console.log("🔍 Scanning Reddit for live marketing opportunities...\n");

subreddits.forEach(sub => {
  const url = `https://www.reddit.com/r/${sub}/new.json?limit=25`;
  
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (!json.data || !json.data.children) return;
        
        const posts = json.data.children.map(c => c.data);
        
        posts.forEach(post => {
          const text = (post.title + " " + (post.selftext || "")).toLowerCase();
          const match = keywords.find(kw => text.includes(kw));
          
          if (match) {
            console.log(`🚨 OPPORTUNITY FOUND in r/${sub} (Matched: "${match}")`);
            console.log(`Title: ${post.title}`);
            console.log(`Link: https://www.reddit.com${post.permalink}`);
            console.log(`Suggested Reply: "Mate I feel this. I actually built pumpprice.live using the new government open data feeds to map out the cheapest stations on any route so you don't get ripped off. Might save you a few quid."\n`);
          }
        });
      } catch (e) {}
    });
  }).on('error', (e) => console.error(e));
});
