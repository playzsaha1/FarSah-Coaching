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

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const founderAnswer = normalize(Deno.env.get("FOUNDER_PROJECT_ANSWER"));
  const roster = JSON.parse(Deno.env.get("DEV_ACCESS_ROSTER") || "[]") as DevRecord[];
  const { name, answer, redirectTo } = await req.json();
  const normalizedName = normalize(name);
  const normalizedAnswer = normalize(answer);

  const dev = roster.find((entry) => entry.aliases.map(normalize).includes(normalizedName));
  if (!dev || normalizedAnswer !== founderAnswer) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email: dev.email,
    options: {
      emailRedirectTo: typeof redirectTo === "string" ? redirectTo : undefined,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ maskedEmail: maskEmail(dev.email) }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
