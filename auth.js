const protectedPages = ["dashboard.html", "ai-tutor.html", "exams.html", "guilds.html", "settings.html"];
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const authConfig = window.FARSAH_CONFIG || {};
const hasSupabaseConfig = Boolean(authConfig.SUPABASE_URL && authConfig.SUPABASE_ANON_KEY);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(authConfig.SUPABASE_URL, authConfig.SUPABASE_ANON_KEY)
  : null;

function setStatus(id, message, tone = "info") {
  const node = document.querySelector(`#${id}`);
  if (!node) return;
  node.textContent = message;
  node.dataset.tone = tone;
}

async function requireSession() {
  if (!protectedPages.includes(currentPage)) return;
  if (!supabaseClient) {
    window.location.href = "access.html";
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  const backupCode = sessionStorage.getItem("farsah_backup_code");

  if (!data.session && backupCode) {
    const { data: backupValidation, error: backupError } = await supabaseClient.functions.invoke("validate-backup-code", {
      body: { backupCode },
    });

    if (!backupError && backupValidation?.allowed) return;

    sessionStorage.removeItem("farsah_backup_code");
  }

  if (!data.session) {
    window.location.href = "access.html";
    return;
  }

  const { data: validation, error } = await supabaseClient.functions.invoke("validate-dev-session");
  if (error || !validation?.allowed) {
    await supabaseClient.auth.signOut();
    window.location.href = "access.html";
  }
}

async function requestOtp(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus("requestStatus", "Add your Supabase URL and anon key in config.js first.", "error");
    return;
  }

  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  const answer = String(form.get("answer") || "").trim();
  setStatus("requestStatus", "Checking developer quest...");

  const { data, error } = await supabaseClient.functions.invoke("request-dev-otp", {
    body: { name, answer, redirectTo: `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}dashboard.html` },
  });

  if (error) {
    setStatus("requestStatus", "Access denied or email could not be sent.", "error");
    document.querySelector("#backupCodeForm")?.removeAttribute("hidden");
    return;
  }

  sessionStorage.setItem("farsah_dev_name", name);
  sessionStorage.setItem("farsah_masked_email", data?.maskedEmail || "your developer email");
  window.location.href = "unlock.html";
}

async function validateBackupCode(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus("backupStatus", "Add your Supabase URL and anon key in config.js first.", "error");
    return;
  }

  const form = new FormData(event.currentTarget);
  const backupCode = String(form.get("backupCode") || "").trim();
  setStatus("backupStatus", "Checking backup code...");

  const { data, error } = await supabaseClient.functions.invoke("validate-backup-code", {
    body: { backupCode },
  });

  if (error || !data?.allowed) {
    setStatus("backupStatus", "Backup code denied.", "error");
    return;
  }

  sessionStorage.setItem("farsah_backup_code", backupCode);
  setStatus("backupStatus", "Unlocked. Loading the beta arena...", "success");
  window.setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 650);
}

document.querySelector("#requestOtpForm")?.addEventListener("submit", requestOtp);
document.querySelector("#backupCodeForm")?.addEventListener("submit", validateBackupCode);
document.querySelector("#signOutButton")?.addEventListener("click", async () => {
  await supabaseClient?.auth.signOut();
  sessionStorage.removeItem("farsah_backup_code");
  window.location.href = "index.html";
});

const hint = document.querySelector("#unlockHint");
if (hint) hint.textContent = `Check ${sessionStorage.getItem("farsah_masked_email") || "your developer email"} for the one-time sign-in link, then open it in this browser.`;

requireSession();
