const fs = require('fs');

let html = fs.readFileSync('Pumpprice/frontend/index.html', 'utf8');

const seoTags = `
    <meta name="description" content="Find the cheapest petrol and diesel on your route. Enter your postcodes to compare live UK supermarket fuel prices without taking a detour." />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://pumpprice.live/" />
    <meta property="og:title" content="Pumpprice | The Route-Based Fuel Price Tracker" />
    <meta property="og:description" content="Find the cheapest petrol and diesel on your route. Enter your postcodes to compare live UK supermarket fuel prices without taking a detour." />
    <meta property="og:image" content="https://pumpprice.live/fuelly-favicon.svg" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://pumpprice.live/" />
    <meta property="twitter:title" content="Pumpprice | The Route-Based Fuel Price Tracker" />
    <meta property="twitter:description" content="Find the cheapest petrol and diesel on your route. Enter your postcodes to compare live UK supermarket fuel prices without taking a detour." />
    <meta property="twitter:image" content="https://pumpprice.live/fuelly-favicon.svg" />
`;

html = html.replace('<title>Pumpprice</title>', `<title>Pumpprice</title>${seoTags}`);
fs.writeFileSync('Pumpprice/frontend/index.html', html);
console.log("SEO Tags added to index.html");
