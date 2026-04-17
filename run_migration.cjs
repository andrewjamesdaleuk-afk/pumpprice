const fetch = require('node-fetch');
require('dotenv').config({ path: 'frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const query = \`
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  postcode TEXT,
  home_lat NUMERIC(10, 7),
  home_lng NUMERIC(10, 7),
  fuel_preference TEXT DEFAULT 'petrol',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`;

async function run() {
  console.log('Executing migration on:', supabaseUrl);
  const res = await fetch(\`\${supabaseUrl}/rest/v1/rpc/exec_sql\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRole,
      'Authorization': \`Bearer \${serviceRole}\`
    },
    body: JSON.stringify({ query })
  });
  
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
run();
