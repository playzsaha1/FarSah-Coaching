const STORAGE_KEY = "farsah_profile";
const GUILD_KEY = "farsah_guild";
const FLASHCARD_KEY = "farsah_flashcards";
const NOTES_KEY = "farsah_notes";
const EXAM_DATE_KEY = "farsah_exam_date";
const PROGRESS_KEY = "farsah_progress_minutes";
const CHAT_KEY = "farsah_chat_messages";
const TASK_KEY = "farsah_tasks";
const EXAM_ATTEMPT_KEY = "farsah_exam_attempts";
const DAILY_GOAL_KEY = "farsah_daily_goal";

let activeFlashcardIndex = 0;
let flashAnswerVisible = false;

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

function renderDashboardStats() {
  setText("#dashboardMinutes", localStorage.getItem(PROGRESS_KEY) || "0");
  setText("#dashboardCards", String(readJson(FLASHCARD_KEY, []).length));
  setText("#dashboardTasks", String(readJson(TASK_KEY, []).filter((task) => !task.done).length));
  setText("#dashboardAttempts", String(readJson(EXAM_ATTEMPT_KEY, []).length));
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

function getCurrentExamAttempt() {
  const system = document.querySelector("#examSystem")?.value || "exam";
  const subject = document.querySelector("#examSubject")?.value || "subject";
  const questionCount = Math.max(5, Math.min(80, Number(document.querySelector("#examQuestions")?.value || "24")));
  const difficulty = document.querySelector("#examDifficulty")?.value || "Mixed";
  return {
    system,
    subject,
    questionCount,
    difficulty,
    savedAt: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
  };
}

function renderExamAttempts() {
  const list = document.querySelector("#examAttemptList");
  if (!list) return;
  const attempts = readJson(EXAM_ATTEMPT_KEY, []);
  list.innerHTML = attempts.length
    ? attempts.map((attempt) => `
      <div>
        <strong>${escapeHtml(attempt.subject)} - ${escapeHtml(attempt.difficulty)}</strong>
        <span>${attempt.questionCount} questions for ${escapeHtml(attempt.system)} - ${escapeHtml(attempt.savedAt)}</span>
      </div>
    `).join("")
    : "No attempts saved.";
  renderDashboardStats();
}

document.querySelector("#saveExamAttempt")?.addEventListener("click", () => {
  const attempts = readJson(EXAM_ATTEMPT_KEY, []);
  attempts.unshift(getCurrentExamAttempt());
  localStorage.setItem(EXAM_ATTEMPT_KEY, JSON.stringify(attempts.slice(0, 12)));
  setText("#examOutput", "Attempt saved. Generate another outline or review your saved attempts below.");
  renderExamAttempts();
});

document.querySelector("#clearExamAttempts")?.addEventListener("click", () => {
  localStorage.removeItem(EXAM_ATTEMPT_KEY);
  renderExamAttempts();
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
let timerStartMinutes = 25;

function renderTimer() {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  setText("#timerDisplay", `${minutes}:${seconds}`);
}

function setTimerFromInput() {
  const input = document.querySelector("#timerMinutes");
  timerStartMinutes = Math.max(1, Math.min(180, Number(input?.value || "25")));
  timerSeconds = timerStartMinutes * 60;
  renderTimer();
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
      const total = Number(localStorage.getItem(PROGRESS_KEY) || "0") + timerStartMinutes;
      localStorage.setItem(PROGRESS_KEY, String(total));
      event.currentTarget.textContent = "Restart timer";
      setText("#timerStatus", `${timerStartMinutes} minutes logged. Nice finish.`);
      renderProgress();
      renderDashboardStats();
      timerSeconds = timerStartMinutes * 60;
    }
  }, 1000);
});

document.querySelector("#timerMinutes")?.addEventListener("change", () => {
  if (timerId) return;
  setTimerFromInput();
});

document.querySelector("#timerReset")?.addEventListener("click", () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
  setTimerFromInput();
  const button = document.querySelector("#timerButton");
  if (button) button.textContent = "Start timer";
  setText("#timerStatus", "Timer reset.");
});

function renderFlashcards() {
  const cards = readJson(FLASHCARD_KEY, []);
  const list = document.querySelector("#flashcardList");
  if (list) {
    list.innerHTML = cards.length
      ? cards.map((card, index) => `<div><strong>${index + 1}. ${escapeHtml(card.question)}</strong><span>${escapeHtml(card.answer)}</span></div>`).join("")
      : "No cards yet.";
  }
  renderFlashcardReview();
  renderDashboardStats();
}

function renderFlashcardReview() {
  const review = document.querySelector("#flashReview");
  if (!review) return;
  const cards = readJson(FLASHCARD_KEY, []);
  if (!cards.length) {
    review.textContent = "Save a card to start review mode.";
    return;
  }
  activeFlashcardIndex = activeFlashcardIndex % cards.length;
  const card = cards[activeFlashcardIndex];
  review.innerHTML = `
    <strong>Card ${activeFlashcardIndex + 1} of ${cards.length}</strong>
    <p>${escapeHtml(card.question)}</p>
    <p class="muted">${flashAnswerVisible ? escapeHtml(card.answer) : "Answer hidden."}</p>
  `;
}

document.querySelector("#saveFlashcard")?.addEventListener("click", () => {
  const question = document.querySelector("#flashQuestion").value.trim();
  const answer = document.querySelector("#flashAnswer").value.trim();
  if (!question || !answer) return;

  const cards = readJson(FLASHCARD_KEY, []);
  cards.push({ question, answer });
  const savedCards = cards.slice(-30);
  localStorage.setItem(FLASHCARD_KEY, JSON.stringify(savedCards));
  document.querySelector("#flashQuestion").value = "";
  document.querySelector("#flashAnswer").value = "";
  activeFlashcardIndex = Math.max(0, savedCards.length - 1);
  flashAnswerVisible = false;
  renderFlashcards();
});

document.querySelector("#showFlashAnswer")?.addEventListener("click", () => {
  flashAnswerVisible = !flashAnswerVisible;
  renderFlashcardReview();
});

document.querySelector("#nextFlashcard")?.addEventListener("click", () => {
  const cards = readJson(FLASHCARD_KEY, []);
  if (!cards.length) return;
  activeFlashcardIndex = (activeFlashcardIndex + 1) % cards.length;
  flashAnswerVisible = false;
  renderFlashcardReview();
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
  setText("#noteSummary", "Notes saved locally.");
});

document.querySelector("#noteSearch")?.addEventListener("input", (event) => {
  const query = event.currentTarget.value.trim().toLowerCase();
  const notes = localStorage.getItem(NOTES_KEY) || notesVault?.value || "";
  if (!query) return setText("#noteSummary", "Type a keyword to search your notes.");
  const matches = notes
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().includes(query))
    .slice(0, 5);
  document.querySelector("#noteSummary").innerHTML = matches.length
    ? `<strong>${matches.length} match${matches.length === 1 ? "" : "es"}</strong><ul>${matches.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
    : "No matching notes yet.";
});

document.querySelector("#summarizeNotes")?.addEventListener("click", () => {
  const notes = (notesVault?.value || "").trim();
  if (!notes) return setText("#noteSummary", "Add notes first, then summarize.");
  const sentences = notes.split(/[.!?\n]+/).map((item) => item.trim()).filter(Boolean);
  const keywords = Array.from(new Set(notes.toLowerCase().match(/\b[a-z]{5,}\b/g) || [])).slice(0, 6);
  document.querySelector("#noteSummary").innerHTML = `
    <strong>Quick summary</strong>
    <p>${escapeHtml(sentences.slice(0, 2).join(". "))}${sentences.length ? "." : ""}</p>
    <p class="muted">Keywords: ${keywords.length ? keywords.map(escapeHtml).join(", ") : "add more detail for keywords."}</p>
  `;
});

function renderProgress() {
  const total = Number(localStorage.getItem(PROGRESS_KEY) || "0");
  const goalInput = document.querySelector("#dailyGoalMinutes");
  const savedGoal = Number(localStorage.getItem(DAILY_GOAL_KEY) || "90");
  if (goalInput && !goalInput.value) goalInput.value = savedGoal;
  const goal = Math.max(1, Number(goalInput?.value || savedGoal));
  const percent = Math.min(100, Math.round((total / goal) * 100));
  setText("#progressOutput", `${total} total study minutes logged. ${percent}% of your current daily target.`);
  const bar = document.querySelector("#progressBar");
  if (bar) bar.style.width = `${percent}%`;
  renderStudySnapshot();
  renderDashboardStats();
}

document.querySelector("#addStudySession")?.addEventListener("click", () => {
  const input = document.querySelector("#studyMinutes");
  const minutes = Math.max(0, Number(input.value || "0"));
  if (!minutes) return;
  const goalInput = document.querySelector("#dailyGoalMinutes");
  if (goalInput?.value) localStorage.setItem(DAILY_GOAL_KEY, String(Math.max(1, Number(goalInput.value))));
  const total = Number(localStorage.getItem(PROGRESS_KEY) || "0") + minutes;
  localStorage.setItem(PROGRESS_KEY, String(total));
  input.value = "";
  renderProgress();
});

document.querySelector("#dailyGoalMinutes")?.addEventListener("change", (event) => {
  localStorage.setItem(DAILY_GOAL_KEY, String(Math.max(1, Number(event.currentTarget.value || "90"))));
  renderProgress();
});

function renderTasks() {
  const list = document.querySelector("#taskList");
  if (!list) return;
  const tasks = readJson(TASK_KEY, []);
  list.innerHTML = tasks.length
    ? tasks.map((task, index) => `
      <label class="task-row">
        <input data-task-index="${index}" type="checkbox" ${task.done ? "checked" : ""} />
        <span>${escapeHtml(task.text)}</span>
      </label>
    `).join("")
    : "<div>Add your first quest above.</div>";
  renderStudySnapshot();
  renderDashboardStats();
}

document.querySelector("#addTask")?.addEventListener("click", () => {
  const input = document.querySelector("#taskInput");
  const text = input.value.trim();
  if (!text) return;
  const tasks = readJson(TASK_KEY, []);
  tasks.push({ text, done: false });
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks.slice(-40)));
  input.value = "";
  renderTasks();
});

document.querySelector("#taskList")?.addEventListener("change", (event) => {
  if (!event.target.matches("[data-task-index]")) return;
  const tasks = readJson(TASK_KEY, []);
  const index = Number(event.target.dataset.taskIndex);
  if (!tasks[index]) return;
  tasks[index].done = event.target.checked;
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  renderTasks();
});

document.querySelector("#clearDoneTasks")?.addEventListener("click", () => {
  const tasks = readJson(TASK_KEY, []).filter((task) => !task.done);
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  renderTasks();
});

document.querySelector("#calculateGrade")?.addEventListener("click", () => {
  const current = Number(document.querySelector("#currentMark")?.value || "0");
  const target = Number(document.querySelector("#targetMark")?.value || "0");
  const weight = Number(document.querySelector("#finalWeight")?.value || "0") / 100;
  if (!current || !target || !weight) return setText("#gradeOutput", "Add all three numbers to calculate.");
  const needed = (target - current * (1 - weight)) / weight;
  const rounded = Math.round(needed * 10) / 10;
  setText("#gradeOutput", rounded > 100 ? `You would need ${rounded}%, so raise coursework or adjust the target.` : `You need about ${rounded}% on the final.`);
});

document.querySelector("#generateMix")?.addEventListener("click", () => {
  const topic = document.querySelector("#mixTopic")?.value.trim() || getProfile().subject || "your topic";
  const lengthText = document.querySelector("#mixLength")?.value || "45 minutes";
  const length = Number(lengthText.match(/\d+/)?.[0] || "45");
  const warmup = Math.max(5, Math.round(length * 0.18));
  const practice = Math.max(10, Math.round(length * 0.48));
  const review = Math.max(5, length - warmup - practice);
  document.querySelector("#mixOutput").innerHTML = `
    <strong>${escapeHtml(topic)} study mix</strong>
    <ul>
      <li>${warmup} min recap: definitions, formulas, or key evidence.</li>
      <li>${practice} min practice: exam-style questions with no notes.</li>
      <li>${review} min review: mark errors and write the next tiny action.</li>
    </ul>
  `;
});

function renderStudySnapshot() {
  const node = document.querySelector("#studySnapshot");
  if (!node) return;
  const total = Number(localStorage.getItem(PROGRESS_KEY) || "0");
  const cards = readJson(FLASHCARD_KEY, []).length;
  const tasks = readJson(TASK_KEY, []);
  const done = tasks.filter((task) => task.done).length;
  node.innerHTML = `
    <div><strong>${total} minutes</strong><span>Logged study time.</span></div>
    <div><strong>${cards} cards</strong><span>Saved for review.</span></div>
    <div><strong>${done}/${tasks.length} quests</strong><span>Completed checklist items.</span></div>
  `;
}

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
renderTasks();
renderExamAttempts();
renderDashboardStats();
