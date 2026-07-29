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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const roster = JSON.parse(Deno.env.get("DEV_ACCESS_ROSTER") || "[]") as DevRecord[];
  const { name, token } = await req.json();
  const normalizedName = normalize(name);
  const dev = roster.find((entry) => entry.aliases.map(normalize).includes(normalizedName));

  if (!dev || !token) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.verifyOtp({
    email: dev.email,
    token: String(token).trim(),
    type: "email",
  });

  if (error || !data.session) {
    return new Response(JSON.stringify({ error: error?.message || "Invalid code" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ session: data.session }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
