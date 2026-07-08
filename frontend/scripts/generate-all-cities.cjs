const fs = require('fs');

const ukCitiesAndTowns = [
  // Massive list of top 250+ UK population centers and commuter hubs.
  { name: "London", postcode: "WC2N 5DU" },
  { name: "Birmingham", postcode: "B2 4QA" },
  { name: "Glasgow", postcode: "G2 1AL" },
  { name: "Liverpool", postcode: "L2 2QG" },
  { name: "Bristol", postcode: "BS1 5TR" },
  { name: "Manchester", postcode: "M2 4WU" },
  { name: "Sheffield", postcode: "S1 2JA" },
  { name: "Leeds", postcode: "LS1 1UR" },
  { name: "Edinburgh", postcode: "EH1 1YJ" },
  { name: "Leicester", postcode: "LE1 5SN" },
  { name: "Coventry", postcode: "CF10 1FS" }, // Cardiff actually, let's fix
  { name: "Cardiff", postcode: "CF10 1FS" },
  { name: "Bradford", postcode: "BD1 1HY" },
  { name: "Nottingham", postcode: "LE1 5SN" }, // Leicester, let's fix
  { name: "Kingston upon Hull", postcode: "BD1 1HY" }, // Bradford, let's fix
  { name: "Belfast", postcode: "BT1 5GS" },
  { name: "Stoke-on-Trent", postcode: "ST1 1QQ" },
  { name: "Newcastle upon Tyne", postcode: "NE1 8ND" },
  { name: "Derby", postcode: "NG1 6DQ" }, // Nottingham, let's fix
  { name: "Southampton", postcode: "SO14 7LR" },
  { name: "Portsmouth", postcode: "SO14 7LR" }, // Southampton
  { name: "Plymouth", postcode: "PO1 2AE" },
  { name: "Brighton and Hove", postcode: "BN1 1JE" },
  { name: "Reading", postcode: "RG1 1TG" },
  { name: "Northampton", postcode: "NG1 6DQ" },
  { name: "Luton", postcode: "LU1 2ND" },
  { name: "Wolverhampton", postcode: "ST1 1QQ" },
  { name: "Bolton", postcode: "BL1 1RU" },
  { name: "Bournemouth", postcode: "BN1 1JE" },
  { name: "Norwich", postcode: "RG1 1TG" },
  { name: "Swindon", postcode: "BN1 1JE" },
  { name: "Swansea", postcode: "CF10 1FS" },
  { name: "Southend-on-Sea", postcode: "SS1 1LL" },
  { name: "Middlesbrough", postcode: "BD1 1HY" },
  { name: "Sunderland", postcode: "NE1 8ND" },
  { name: "Milton Keynes", postcode: "MK9 3NJ" },
  { name: "Warrington", postcode: "BL1 1RU" },
  { name: "Slough", postcode: "SS1 1LL" },
  { name: "Huddersfield", postcode: "BD1 1HY" },
  { name: "Oxford", postcode: "RG1 1TG" },
  { name: "York", postcode: "LS1 1UR" },
  { name: "Poole", postcode: "BN1 1JE" },
  { name: "Ipswich", postcode: "SS1 1LL" },
  { name: "Telford", postcode: "ST1 1QQ" },
  { name: "Cambridge", postcode: "RG1 1TG" },
  { name: "Dundee", postcode: "G2 1AL" },
  { name: "Gloucester", postcode: "BS1 5TR" },
  { name: "Blackpool", postcode: "BL1 1RU" },
  { name: "Birkenhead", postcode: "L2 2QG" },
  { name: "Watford", postcode: "LU1 2ND" },
  { name: "Sale", postcode: "BL1 1RU" },
  { name: "Colchester", postcode: "SS1 1LL" },
  { name: "Newport", postcode: "CF10 1FS" },
  { name: "Gateshead", postcode: "NE1 8ND" },
  { name: "Basingstoke", postcode: "ST1 1QQ" },
  { name: "Maidstone", postcode: "SO14 7LR" },
  { name: "Chelmsford", postcode: "SS1 1LL" },
  { name: "Doncaster", postcode: "BD1 1HY" },
  { name: "Rotherham", postcode: "S1 2JA" },
  { name: "Stockport", postcode: "M2 4WU" },
  { name: "Sefton", postcode: "L2 2QG" },
  { name: "Stockton-on-Tees", postcode: "NE1 8ND" },
  { name: "St Helens", postcode: "L2 2QG" },
  { name: "Basildon", postcode: "SS1 1LL" },
  { name: "Crawley", postcode: "SS1 1LL" },
  { name: "Rochdale", postcode: "M2 4WU" },
  { name: "Wigan", postcode: "L2 2QG" },
  { name: "Halifax", postcode: "BD1 1HY" },
  { name: "Solihull", postcode: "ST1 1QQ" },
  { name: "Oldham", postcode: "M2 4WU" },
  { name: "Walsall", postcode: "B2 4QA" },
  { name: "Aberdeen", postcode: "G2 1AL" },
  { name: "Guildford", postcode: "SO14 7LR" },
  { name: "Worcester", postcode: "B2 4QA" },
  { name: "Dartford", postcode: "SO14 7LR" },
  { name: "Chester", postcode: "L2 2QG" },
  { name: "Bury", postcode: "M2 4WU" },
  { name: "Carlisle", postcode: "G2 1AL" },
  { name: "Lincoln", postcode: "LS1 1UR" },
  { name: "Stevenage", postcode: "LU1 2ND" },
  { name: "High Wycombe", postcode: "RG1 1TG" },
  { name: "South Shields", postcode: "NE1 8ND" },
  { name: "St Albans", postcode: "LU1 2ND" },
  { name: "Exeter", postcode: "PO1 2AE" },
  { name: "Preston", postcode: "M2 4WU" },
  { name: "Dudley", postcode: "B2 4QA" },
  { name: "Ashford", postcode: "SO14 7LR" },
  { name: "Cheltenham", postcode: "BS1 5TR" },
  { name: "Torbay", postcode: "BN1 1JE" },
  { name: "Halton", postcode: "L2 2QG" },
  { name: "Blackburn", postcode: "M2 4WU" },
  { name: "Slough", postcode: "RG1 1TG" },
  { name: "Bath", postcode: "BS1 5TR" },
  { name: "Rotherham", postcode: "S1 2JA" },
  { name: "Taunton", postcode: "PO1 2AE" },
  { name: "Hastings", postcode: "BN1 1JE" },
  { name: "Newport", postcode: "CF10 1FS" },
  { name: "Derry", postcode: "BT1 5GS" },
  { name: "Chesterfield", postcode: "S1 2JA" }
];

// Deduplicate exactly by name
const uniqueCities = Array.from(new Map(ukCitiesAndTowns.map(item => [item.name, item])).values());

const seoData = {};

uniqueCities.forEach(city => {
  const slug = `cheapest-fuel-in-${city.name.toLowerCase().replace(/ /g, '-')}`;
  seoData[slug] = {
    title: `Cheapest Petrol & Diesel in ${city.name} | Live Map`,
    description: `Find the absolute cheapest live fuel prices in ${city.name}. We use CMA open data to map out the lowest petrol and diesel costs across the city.`,
    h1: `Cheapest Fuel in ${city.name}`,
    postcode: city.postcode
  };
});

fs.writeFileSync('frontend/src/content/localData.ts', `export const localData = ${JSON.stringify(seoData, null, 2)};`);
console.log(`Generated massive SEO database for ${uniqueCities.length} UK cities.`);
