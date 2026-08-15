const STORAGE_KEY = "farsah_profile";
const GUILD_KEY = "farsah_guild";
const FLASHCARD_KEY = "farsah_flashcards";
const NOTES_KEY = "farsah_notes";
const EXAM_DATE_KEY = "farsah_exam_date";
const PROGRESS_KEY = "farsah_progress_minutes";
const CHAT_KEY = "farsah_chat_messages";

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
const styleInput = document.querySelector("#styleInput");
const timeInput = document.querySelector("#timeInput");

coachButton?.addEventListener("click", () => {
  const topic = topicInput.value.trim() || "your selected topic";
  const level = levelInput.value;
  const style = styleInput?.value || "Step-by-step";
  const time = timeInput?.value || "20 minutes";
  const focus = topic.toLowerCase().includes("essay")
    ? "thesis, evidence, paragraph structure, and timed response polish"
    : topic.toLowerCase().includes("calculus")
      ? "definitions, graph meaning, worked substitutions, and exam traps"
      : "core meaning, worked examples, error checks, and recall practice";

  document.querySelector("#coachOutput").innerHTML = `
    <div class="coach-plan">
      <div><strong>${escapeHtml(topic)}</strong> for <strong>${escapeHtml(level)}</strong></div>
      <p>Use a ${escapeHtml(style.toLowerCase())} session for ${escapeHtml(time)}. Focus on ${escapeHtml(focus)}.</p>
      <ol>
        <li><strong>Explain it simply:</strong> write the idea in one sentence, then add the key formula, rule, or structure.</li>
        <li><strong>Worked example:</strong> solve one medium question slowly and mark the exact step where mistakes usually happen.</li>
        <li><strong>Practice ladder:</strong> do 2 easy, 2 exam-style, and 1 challenge question without looking at notes.</li>
        <li><strong>Checkpoint:</strong> if you miss more than one question, redo the worked example with different numbers or evidence.</li>
        <li><strong>Exit ticket:</strong> write one trap, one fix, and one question to ask a tutor next time.</li>
      </ol>
    </div>
  `;
});

document.querySelector("#generatePaper")?.addEventListener("click", () => {
  const system = document.querySelector("#examSystem")?.value || "exam";
  const subject = document.querySelector("#examSubject")?.value || "subject";
  const questionCount = Math.max(5, Math.min(80, Number(document.querySelector("#examQuestions")?.value || "24")));
  const difficulty = document.querySelector("#examDifficulty")?.value || "Mixed";
  const sections = questionCount >= 30 ? "three sections" : questionCount >= 16 ? "two sections" : "one focused section";
  const minutes = Math.max(20, Math.round(questionCount * 2.5));

  document.querySelector("#examOutput").innerHTML = `
    <strong>${escapeHtml(subject)} ${escapeHtml(system)} past paper outline</strong>
    <ul>
      <li>${questionCount} questions across ${sections}.</li>
      <li>${escapeHtml(difficulty)} difficulty with a ${minutes} minute timer.</li>
      <li>Start with short-answer recall, then move into application and one reflection question.</li>
      <li>After finishing, mark three errors: knowledge gap, rushed step, or wording mistake.</li>
    </ul>
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

function renderChat() {
  const feed = document.querySelector("#chatFeed");
  if (!feed) return;
  const messages = readJson(CHAT_KEY, []);
  feed.innerHTML = messages.length
    ? messages.map((item) => `
      <div class="chat-message">
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.message)}</p>
        <time>${escapeHtml(item.time)}</time>
      </div>
    `).join("")
    : '<div class="chat-message"><strong>FarSah Beta</strong><p>No messages yet. Post the first study update.</p><time>Local room</time></div>';
  feed.scrollTop = feed.scrollHeight;
}

document.querySelector("#chatForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim() || getProfile().name || "Student";
  const message = String(form.get("message") || "").trim();
  if (!message) return;
  const messages = readJson(CHAT_KEY, []);
  messages.push({
    name,
    message,
    time: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
  });
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-60)));
  document.querySelector("#chatMessage").value = "";
  renderChat();
});

document.querySelector("#clearChat")?.addEventListener("click", () => {
  localStorage.removeItem(CHAT_KEY);
  renderChat();
});

renderProfile();
renderGuild();
renderTimer();
renderFlashcards();
renderCountdown();
renderProgress();
renderChat();
