const fs = require('fs');

let file = fs.readFileSync('frontend/src/content/localData.ts', 'utf8');
// Just parse the JSON object out of the string
let jsonStr = file.replace('export const localData = ', '');
jsonStr = jsonStr.replace(/;$/, '');
const localData = JSON.parse(jsonStr);

const posts = [
  "cheapest-time-to-buy-fuel-uk",
  "e10-vs-e5-petrol-differences",
  "uk-fuel-price-fluctuations-explained",
  "how-to-improve-mpg-fuel-economy",
  "anatomy-of-uk-fuel-prices",
  "global-conflicts-uk-pump-prices",
  "hypermiling-extreme-fuel-saving",
  "supermarket-vs-premium-fuels",
  "diesel-vs-petrol-running-costs-2026",
  "ev-charging-vs-traditional-fuel-costs",
  "do-fuel-additives-work",
  "fuel-duty-freeze-impact",
  "top-apps-to-find-cheap-fuel-uk",
  "is-carpooling-worth-the-effort",
  "future-of-synthetic-fuels-uk",
  "cheapest-petrol-m1-motorway-services",
  "asda-vs-tesco-cheapest-supermarket-fuel",
  "company-car-mileage-allowance-profit"
];

const today = new Date().toISOString().split('T')[0];
const domain = 'https://pumpprice.live';

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/locations</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

posts.forEach(slug => {
  xml += `  <url>
    <loc>${domain}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

Object.keys(localData).forEach(slug => {
  // Base generic URL
  xml += `  <url>
    <loc>${domain}/city/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;

  // Petrol specific URL
  const petrolSlug = slug.replace('-fuel-', '-petrol-');
  xml += `  <url>
    <loc>${domain}/city/${petrolSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;

  // Diesel specific URL
  const dieselSlug = slug.replace('-fuel-', '-diesel-');
  xml += `  <url>
    <loc>${domain}/city/${dieselSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync('frontend/public/sitemap.xml', xml);
console.log(`Sitemap generated with ${posts.length} posts and ${Object.keys(localData).length * 3} city pages.`);
