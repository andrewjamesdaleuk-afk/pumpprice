require('dotenv').config({ path: 'frontend/.env' });
const fetch = require('node-fetch');

async function run() {
    const url = `${process.env.VITE_SUPABASE_URL}/functions/v1/harvester`;
    console.log(`Calling ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
            }
        });
        const json = await response.json();
        console.log('Harvester result:', json);
    } catch (e) {
        console.error('Error calling harvester:', e.message);
    }
}
run();
