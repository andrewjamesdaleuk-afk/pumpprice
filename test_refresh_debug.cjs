require('dotenv').config({ path: 'frontend/.env' });
const { createClient } = require('@supabase/supabase-js');

async function testRefresh() {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    console.log('Triggering refresh_all_insights...');
    const { data, error } = await supabase.rpc('refresh_all_insights');
    if (error) {
        console.error('Refresh failed:', error);
    } else {
        console.log('Refresh succeeded:', data);
    }
}
testRefresh();
