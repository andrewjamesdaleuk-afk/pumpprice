const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();

const cityCoords = [{"name":"London","lon":-0.128269,"lat":51.507211},{"name":"Birmingham","lon":-1.898007,"lat":52.477677},{"name":"Glasgow","lon":-4.249812,"lat":55.860531},{"name":"Bristol","lon":-2.60207,"lat":51.452605},{"name":"Manchester","lon":-2.242935,"lat":53.480597},{"name":"Sheffield","lon":-1.471485,"lat":53.381091},{"name":"Leeds","lon":-1.548522,"lat":53.802177},{"name":"Edinburgh","lon":-3.19036,"lat":55.950317},{"name":"Leicester","lon":-1.135125,"lat":52.63208},{"name":"Coventry","lon":-3.180492,"lat":51.476633},{"name":"Cardiff","lon":-3.180492,"lat":51.476633},{"name":"Bradford","lon":-1.753296,"lat":53.792327},{"name":"Nottingham","lon":-1.135125,"lat":52.63208},{"name":"Kingston upon Hull","lon":-1.753296,"lat":53.792327},{"name":"Belfast","lon":-5.930077,"lat":54.596633},{"name":"Derby","lon":-1.152021,"lat":52.952374},{"name":"Southampton","lon":-1.406971,"lat":50.907674},{"name":"Portsmouth","lon":-1.406971,"lat":50.907674},{"name":"Plymouth","lon":-1.102846,"lat":50.790302},{"name":"Brighton and Hove","lon":-0.140951,"lat":50.820853},{"name":"Reading","lon":-0.971855,"lat":51.456322},{"name":"Northampton","lon":-1.152021,"lat":52.952374},{"name":"Bolton","lon":-2.430772,"lat":53.578247},{"name":"Bournemouth","lon":-0.140951,"lat":50.820853},{"name":"Norwich","lon":-0.971855,"lat":51.456322},{"name":"Swindon","lon":-0.140951,"lat":50.820853},{"name":"Swansea","lon":-3.180492,"lat":51.476633},{"name":"Southend-on-Sea","lon":0.712069,"lat":51.539173},{"name":"Middlesbrough","lon":-1.753296,"lat":53.792327},{"name":"Warrington","lon":-2.430772,"lat":53.578247},{"name":"Slough","lon":-0.971855,"lat":51.456322},{"name":"Huddersfield","lon":-1.753296,"lat":53.792327},{"name":"Oxford","lon":-0.971855,"lat":51.456322},{"name":"York","lon":-1.548522,"lat":53.802177},{"name":"Poole","lon":-0.140951,"lat":50.820853},{"name":"Ipswich","lon":0.712069,"lat":51.539173},{"name":"Cambridge","lon":-0.971855,"lat":51.456322},{"name":"Dundee","lon":-4.249812,"lat":55.860531},{"name":"Gloucester","lon":-2.60207,"lat":51.452605},{"name":"Blackpool","lon":-2.430772,"lat":53.578247},{"name":"Sale","lon":-2.430772,"lat":53.578247},{"name":"Colchester","lon":0.712069,"lat":51.539173},{"name":"Newport","lon":-3.180492,"lat":51.476633},{"name":"Maidstone","lon":-1.406971,"lat":50.907674},{"name":"Chelmsford","lon":0.712069,"lat":51.539173},{"name":"Doncaster","lon":-1.753296,"lat":53.792327},{"name":"Rotherham","lon":-1.471485,"lat":53.381091},{"name":"Stockport","lon":-2.242935,"lat":53.480597},{"name":"Basildon","lon":0.712069,"lat":51.539173},{"name":"Crawley","lon":0.712069,"lat":51.539173},{"name":" Rochdale","lon":-2.242935,"lat":53.480597},{"name":"Halifax","lon":-1.753296,"lat":53.792327},{"name":"Oldham","lon":-2.242935,"lat":53.480597},{"name":"Walsall","lon":-1.898007,"lat":52.477677},{"name":"Aberdeen","lon":-4.249812,"lat":55.860531},{"name":"Guildford","lon":-1.406971,"lat":50.907674},{"name":"Worcester","lon":-1.898007,"lat":52.477677},{"name":"Dartford","lon":-1.406971,"lat":50.907674},{"name":"Bury","lon":-2.242935,"lat":53.480597},{"name":"Carlisle","lon":-4.249812,"lat":55.860531},{"name":"Lincoln","lon":-1.548522,"lat":53.802177},{"name":"High Wycombe","lon":-0.971855,"lat":51.456322},{"name":"Exeter","lon":-1.102846,"lat":50.790302},{"name":"Preston","lon":-2.242935,"lat":53.480597},{"name":"Dudley","lon":-1.898007,"lat":52.477677},{"name":"Ashford","lon":-1.406971,"lat":50.907674},{"name":"Cheltenham","lon":-2.60207,"lat":51.452605},{"name":"Torbay","lon":-0.140951,"lat":50.820853},{"name":"Blackburn","lon":-2.242935,"lat":53.480597},{"name":"Bath","lon":-2.60207,"lat":51.452605},{"name":"Taunton","lon":-1.102846,"lat":50.790302},{"name":"Hastings","lon":-0.140951,"lat":50.820853},{"name":"Derry","lon":-5.930077,"lat":54.596633},{"name":"Chesterfield","lon":-1.471485,"lat":53.381091}];

const url = 'https://pvutijbggbbrobjlpwrp.supabase.co/rest/v1/rpc/update_city_insight_single';
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
  console.log('Processing 74 cities...');
  for (const city of cityCoords) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          city_name_in: city.name,
          lon_in: city.lon,
          lat_in: city.lat
        })
      });
      process.stdout.write(res.status === 204 ? '.' : 'x');
    } catch (e) {
      process.stdout.write('E');
    }
  }
  
  console.log('\nAggregating results into master insights table...');
  const aggUrl = 'https://pvutijbggbbrobjlpwrp.supabase.co/rest/v1/rpc/refresh_city_insights_from_buffer';
  const resAgg = await fetch(aggUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  console.log('Final Aggregation Status:', resAgg.status);
}

run();
