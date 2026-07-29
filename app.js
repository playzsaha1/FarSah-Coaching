const STORAGE_KEY = "farsah_profile";
const GUILD_KEY = "farsah_guild";
const FLASHCARD_KEY = "farsah_flashcards";
const NOTES_KEY = "farsah_notes";
const EXAM_DATE_KEY = "farsah_exam_date";
const PROGRESS_KEY = "farsah_progress_minutes";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char];
  });
}

function getProfile() {
  return readJson(STORAGE_KEY, {
    name: "Student",
    yearLevel: "Set",
    subject: "Set",
    examGoal: "Set",
    studyMode: "Set",
    dailyTarget: "",
    quests: "",
  });
}

function renderProfile() {
  const profile = getProfile();
  document.querySelectorAll("[data-profile]").forEach((node) => {
    node.textContent = profile[node.dataset.profile] || "Set";
  });

  const questList = document.querySelector("#questList");
  if (questList) {
    const quests = String(profile.quests || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    questList.innerHTML = quests.length
      ? quests.map((quest) => `<li>${escapeHtml(quest)}</li>`).join("")
      : "<li>Add your goals in Settings to build a personal quest board.</li>";
  }

  const form = document.querySelector("#profileForm");
  if (form) {
    Object.entries(profile).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  }
}

document.querySelector("#profileForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const profile = Object.fromEntries(form.entries());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  setText("#profileStatus", "Profile saved.");
  renderProfile();
});

const coachButton = document.querySelector("#coachButton");
const topicInput = document.querySelector("#topicInput");
const levelInput = document.querySelector("#levelInput");

coachButton?.addEventListener("click", () => {
  const topic = topicInput.value.trim() || "your selected topic";
  const level = levelInput.value;

  document.querySelector("#coachOutput").innerHTML = `
    <strong>${escapeHtml(topic)}</strong><br>
    Quest plan for <strong>${escapeHtml(level)}</strong>:
    <br>1. warm-up recap,
    <br>2. worked example with trap alerts,
    <br>3. adaptive practice streak,
    <br>4. self-marked reflection,
    <br>5. revision reminder if accuracy stays under 80%.
  `;
});

function renderGuild() {
  const guild = readJson(GUILD_KEY, {});
  setText("#guildNameOutput", guild.guildName || "No guild yet");
  setText("#guildGoalOutput", guild.guildGoal || "Add one above");
  setText("#guildMembersOutput", guild.guildMembers ? `Members: ${guild.guildMembers}` : "Members will appear here.");

  const form = document.querySelector("#guildForm");
  if (form) {
    Object.entries(guild).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  }
}

document.querySelector("#guildForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem(GUILD_KEY, JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())));
  renderGuild();
});

let timerSeconds = 25 * 60;
let timerId = null;

function renderTimer() {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  setText("#timerDisplay", `${minutes}:${seconds}`);
}

document.querySelector("#timerButton")?.addEventListener("click", (event) => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    event.currentTarget.textContent = "Start timer";
    return;
  }

  event.currentTarget.textContent = "Pause timer";
  timerId = window.setInterval(() => {
    timerSeconds = Math.max(0, timerSeconds - 1);
    renderTimer();
    if (timerSeconds === 0) {
      clearInterval(timerId);
      timerId = null;
      event.currentTarget.textContent = "Restart timer";
      timerSeconds = 25 * 60;
    }
  }, 1000);
});

function renderFlashcards() {
  const cards = readJson(FLASHCARD_KEY, []);
  const list = document.querySelector("#flashcardList");
  if (!list) return;
  list.innerHTML = cards.length
    ? cards.map((card) => `<div><strong>${escapeHtml(card.question)}</strong><span>${escapeHtml(card.answer)}</span></div>`).join("")
    : "No cards yet.";
}

document.querySelector("#saveFlashcard")?.addEventListener("click", () => {
  const question = document.querySelector("#flashQuestion").value.trim();
  const answer = document.querySelector("#flashAnswer").value.trim();
  if (!question || !answer) return;

  const cards = readJson(FLASHCARD_KEY, []);
  cards.push({ question, answer });
  localStorage.setItem(FLASHCARD_KEY, JSON.stringify(cards.slice(-12)));
  document.querySelector("#flashQuestion").value = "";
  document.querySelector("#flashAnswer").value = "";
  renderFlashcards();
});

function renderCountdown() {
  const savedDate = localStorage.getItem(EXAM_DATE_KEY);
  const input = document.querySelector("#examDate");
  if (input && savedDate) input.value = savedDate;
  if (!savedDate) return setText("#countdownOutput", "No exam date saved.");

  const today = new Date();
  const target = new Date(`${savedDate}T00:00:00`);
  const days = Math.ceil((target - today) / 86400000);
  setText("#countdownOutput", days >= 0 ? `${days} days until exam day.` : "That exam date has passed.");
}

document.querySelector("#saveExamDate")?.addEventListener("click", () => {
  const value = document.querySelector("#examDate").value;
  if (!value) return;
  localStorage.setItem(EXAM_DATE_KEY, value);
  renderCountdown();
});

const notesVault = document.querySelector("#notesVault");
if (notesVault) notesVault.value = localStorage.getItem(NOTES_KEY) || "";
document.querySelector("#saveNotes")?.addEventListener("click", () => {
  localStorage.setItem(NOTES_KEY, notesVault.value);
});

function renderProgress() {
  const total = Number(localStorage.getItem(PROGRESS_KEY) || "0");
  setText("#progressOutput", `${total} total study minutes logged.`);
}

document.querySelector("#addStudySession")?.addEventListener("click", () => {
  const input = document.querySelector("#studyMinutes");
  const minutes = Math.max(0, Number(input.value || "0"));
  if (!minutes) return;
  const total = Number(localStorage.getItem(PROGRESS_KEY) || "0") + minutes;
  localStorage.setItem(PROGRESS_KEY, String(total));
  input.value = "";
  renderProgress();
});

renderProfile();
renderGuild();
renderTimer();
renderFlashcards();
renderCountdown();
renderProgress();
