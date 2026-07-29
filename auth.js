const ACCESS_CODE = "42842806280904";
const FOUNDER_PROJECT_ANSWER = "lucente";
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

function unlockAccess(event) {
  event.preventDefault();

  const form = new FormData(event.currentTarget);
  const answer = String(form.get("answer") || "").trim().toLowerCase();
  const code = String(form.get("accessCode") || "").trim();

  if (answer !== FOUNDER_PROJECT_ANSWER || code !== ACCESS_CODE) {
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
