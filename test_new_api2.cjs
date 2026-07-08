const fetch = require('node-fetch');
const clientId = '3OO0Y5G1XXMyWXDwvL8bgLynHNhqpn6S';
const clientSecret = 'k284SMk2nEpSBKHypSvex3UKup1daylnUiTr2fYjjBTBWIjIRAET1AuOCo8sLgiS';
async function run() {
    const tokenRes = await fetch('https://www.developer.fuel-finder.service.gov.uk/api/v1/oauth/generate_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        })
    });
    const tokenResult = await tokenRes.json();
    const token = tokenResult.data.access_token;
    const res = await fetch(`https://www.developer.fuel-finder.service.gov.uk/api/v1/pfs/fuel-prices?batch-number=2`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Length:", data.length);
    console.log("Sample:", JSON.stringify(data[0]));
}
run();
