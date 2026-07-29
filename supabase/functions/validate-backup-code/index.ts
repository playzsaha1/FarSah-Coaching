const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(value: unknown) {
  return String(value || "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { backupCode } = await req.json();
  const expectedCode = normalize(Deno.env.get("BACKUP_ACCESS_CODE"));
  const allowed = Boolean(expectedCode) && normalize(backupCode) === expectedCode;

  return new Response(JSON.stringify({ allowed }), {
    status: allowed ? 200 : 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
