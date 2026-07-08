require('dotenv').config({path: '.env'});
const fetch = require('node-fetch');
const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Let's use the local supabase cli to push the database function directly
  // Actually, we can just replace the function body in the local migration or schema and ask them to run it, 
  // or use `supabase db execute` if they are linked. Let's see if we are linked.
  const out = execSync('npx supabase status').toString();
  console.log(out);
} catch(e) {
  console.log("Not linked to a local db or no docker. Cannot easily execute sql.");
}
