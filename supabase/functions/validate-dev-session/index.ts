import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DevRecord = {
  email: string;
  aliases: string[];
};

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return new Response(JSON.stringify({ allowed: false }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const roster = JSON.parse(Deno.env.get("DEV_ACCESS_ROSTER") || "[]") as DevRecord[];
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  const email = normalize(data.user?.email);
  const allowed = !error && roster.some((entry) => normalize(entry.email) === email);

  return new Response(JSON.stringify({ allowed }), {
    status: allowed ? 200 : 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
