const ACCESS_CODE_HASH = "4ff60185fba8153ce6f81eb0b479e795c2dbd58b395f20a8e337dc18d356a88d";
const FOUNDER_PROJECT_ANSWER_HASH = "5b3c86306c34a84375ff30a5834085d235e678f63dab9700d1e2c34faf27759f";
const protectedPages = ["dashboard.html", "ai-tutor.html", "exams.html", "guilds.html", "settings.html"];
const currentPage = window.location.pathname.split("/").pop() || "index.html";

function setStatus(id, message, tone = "info") {
  const node = document.querySelector(`#${id}`);
  if (!node) return;
  node.textContent = message;
  node.dataset.tone = tone;
}

function hasAccess() {
  return sessionStorage.getItem("farsah_beta_access") === "unlocked";
}

function requireAccess() {
  if (protectedPages.includes(currentPage) && !hasAccess()) {
    window.location.href = "access.html";
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function unlockAccess(event) {
  event.preventDefault();

  const form = new FormData(event.currentTarget);
  const answer = String(form.get("answer") || "").trim().toLowerCase();
  const code = String(form.get("accessCode") || "").trim();
  const [answerHash, codeHash] = await Promise.all([sha256(answer), sha256(code)]);

  if (answerHash !== FOUNDER_PROJECT_ANSWER_HASH || codeHash !== ACCESS_CODE_HASH) {
    setStatus("accessStatus", "Access denied. Check the founder answer and access code.", "error");
    return;
  }

  sessionStorage.setItem("farsah_beta_access", "unlocked");
  setStatus("accessStatus", "Unlocked. Loading the beta arena...", "success");
  window.setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 650);
}

document.querySelector("#accessCodeForm")?.addEventListener("submit", unlockAccess);
document.querySelector("#signOutButton")?.addEventListener("click", () => {
  sessionStorage.removeItem("farsah_beta_access");
  window.location.href = "index.html";
});

requireAccess();
