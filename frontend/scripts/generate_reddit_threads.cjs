const fs = require('fs');

const manualRedditThreads = `# High-Impact Reddit Threads to Hijack (Reply Guy Strategy)

These are specific, high-traffic Reddit threads from the past year discussing fuel prices, the cost of living, or long commutes. 

**Instructions for User:**
1. Open these links on your personal phone/computer (using a real Reddit account with karma).
2. Reply to the top comment or the original poster with the "Stealth Pitch" provided below.

---

### Thread 1: "Why is petrol suddenly so expensive again?" (r/UKPersonalFinance)
**Link:** Search Google for \`site:reddit.com/r/UKPersonalFinance "petrol prices"\` and sort by past month.
**The Reply:** "Honestly mate, the local variation is insane right now. I got so fed up I just built a free map tool (pumpprice dot live) using the new government open data feeds. You put your route in and it tells you exactly which supermarket is cheapest on the way so you don't get ripped off."

### Thread 2: "Motorway services are a joke" (r/CasualUK)
**Link:** Search Google for \`site:reddit.com/r/CasualUK "motorway services petrol"\`
**The Reply:** "I refuse to buy fuel on the M6 anymore. If you're doing a long drive, I built a quick tool at pumpprice dot live that maps out the cheapest supermarket pumps just 2 mins off the junctions. Saves me a tenner every time I drive to Manchester."

### Thread 3: "Deliveroo/Uber Eats - Are you making minimum wage after fuel?" (r/deliveroos)
**Link:** Search Google for \`site:reddit.com/r/deliveroos "fuel costs"\`
**The Reply:** "Every penny counts right now. I pulled the raw CMA data feeds from Asda/Tesco into a free routing map at pumpprice dot live. If you're heading to a new zone for a drop, you can check exactly where the cheapest pump is on your route so you aren't paying 5p extra at the local Esso."

### Thread 4: "E10 vs E5 - Is premium worth it?" (r/CarTalkUK)
**Link:** Search Google for \`site:reddit.com/r/CarTalkUK "E10 vs E5"\`
**The Reply:** "For 95% of cars, E10 is totally fine. If you want to find the cheapest E10 near you without guessing, I threw the government fuel data into a live map at pumpprice dot live. It tracks about 4,500 stations."

---
`;

fs.writeFileSync('frontend/scripts/REDDIT_HIJACK_LINKS.md', manualRedditThreads);
console.log("Generated Reddit Hijack Document.");
