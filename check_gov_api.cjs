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
    
    // We can't search by postcode easily, but we know the node_id is 3075da0741035553f3bff0ea5f9965c816763ebd7907783a59086292f0abfa47
    const url = `https://www.developer.fuel-finder.service.gov.uk/api/v1/prices/3075da0741035553f3bff0ea5f9965c816763ebd7907783a59086292f0abfa47`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    
    if (res.ok) {
        console.log("Direct GOV API response for KT22 0EF:");
        console.log(JSON.stringify(await res.json(), null, 2));
    } else {
        console.log("Failed to fetch from GOV API, status:", res.status);
    }
}
run();
