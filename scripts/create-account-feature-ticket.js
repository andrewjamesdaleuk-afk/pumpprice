import dotenv from 'dotenv';
dotenv.config();
import https from 'https';

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

const data = JSON.stringify({
  parent: { database_id: DB_ID },
  properties: {
    Task: {
      title: [{ text: { content: 'Feature: Low-Friction User Accounts & Personalization (Detailed Spec)' } }]
    },
    Status: { status: { name: 'In progress' } },
    Project: { multi_select: [{ name: 'Pumpprice' }] }
  },
  children: [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: '1. Supabase Backend Setup' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Enable Email Auth with "Confirm Email" DISABLED for instant onboarding.' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Create "public.profiles" table: id (UUID), email, name, postcode, home_lat, home_lng, fuel_preference.' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Implement Postgres Trigger to auto-create profile row on auth.users signup.' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Enable RLS: Users can ONLY select/update their own profile data.' } }] }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: '2. UI & Design Standards' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Layout Constraint: All cards/forms MUST use "max-w-md mx-auto" to match homepage standard.' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Theme: Strict Dark Blue/Navy and White (bg-slate-950, text-white, text-blue-200).' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Brand Colors: ONLY used for the Fuel Preference toggle (Emerald Green/Sky Blue).' } }] }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: '3. "My Account" Page Content' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Fields: Name (Editable), Email (Read-only), Local Postcode (Geocoded via postcodes.io).' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Primary Action: "Save Changes" (Solid White button with Dark Blue text).' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Secondary Action: "Log Out" (Transparent text-white/70 button).' } }] }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: '4. Business Logic' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Implement Global AuthContext for session management.' } }] }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Home Personalization: Logged-in users default to Local Search using saved postcode/fuel.' } }] }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: 'IMPORTANT: Local development and testing only. Verify onboarding flow end-to-end before deployment.' },
          annotations: { bold: true, color: "red" }
        }]
      }
    }
  ]
});

const options = {
  hostname: 'api.notion.com',
  path: '/v1/pages',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let resData = '';
  res.on('data', (d) => { resData += d; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Successfully created detailed Account Feature ticket in Notion.');
    } else {
      console.error('Failed to create ticket. Status:', res.statusCode);
      console.error(resData);
    }
  });
});

req.on('error', (e) => { console.error(e); });
req.write(data);
req.end();
