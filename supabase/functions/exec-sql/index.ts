import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";

const databaseUrl = Deno.env.get("SUPABASE_DB_URL") || "";

serve(async (req) => {
  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");
    
    const pool = new postgres.Pool(databaseUrl, 1, true);
    const connection = await pool.connect();
    
    try {
      const result = await connection.queryObject(query);
      return new Response(JSON.stringify({ success: true, result: result.rows }), {
        headers: { "Content-Type": "application/json" }
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
