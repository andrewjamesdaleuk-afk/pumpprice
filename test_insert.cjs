require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');
async function run() {
    const url = `http://127.0.0.1:54321/functions/v1/harvester`;
    console.log("Calling local harvester...");
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}` }
    });
    console.log(res.status);
    console.log(await res.text());
}
run();
