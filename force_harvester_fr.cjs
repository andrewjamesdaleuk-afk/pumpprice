require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');

async function run() {
    const url = `${process.env.VITE_SUPABASE_URL}/functions/v1/harvester-fr`;
    console.log(`Calling French Harvester...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
            }
        });
        const json = await response.json();
        console.log('Harvester FR result:', json);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
run();
