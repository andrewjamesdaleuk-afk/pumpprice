require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.log("Updating existing 'Unknown' stations in the database...");
  const sql = `
    UPDATE stations 
    SET brand = split_part(address, ',', 2) || ' Station'
    WHERE country_code = 'FR' AND brand = 'Unknown' AND address LIKE '%,%';
  `;
  await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/exec-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  const sql2 = `
    UPDATE stations 
    SET brand = 'French Station'
    WHERE country_code = 'FR' AND brand = 'Unknown';
  `;
  await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/exec-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: sql2 })
  });
  console.log("Done.");
}
run();
