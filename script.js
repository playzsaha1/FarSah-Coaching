const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const themeToggle = document.querySelector("#themeToggle");
const coachButton = document.querySelector("#coachButton");
const topicInput = document.querySelector("#topicInput");
const levelInput = document.querySelector("#levelInput");
const betaForm = document.querySelector(".beta-form");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

coachButton.addEventListener("click", () => {
  const topic = topicInput.value.trim() || "your selected topic";
  const level = levelInput.value;

  document.querySelector("#coachOutput").innerHTML = `
    <strong>${topic}</strong><br>
    FarSah Coaching would explain this at a <strong>${level}</strong> level, then assign:
    <br>1. a two-minute concept recap,
    <br>2. one worked example with mistake traps,
    <br>3. six adaptive practice questions,
    <br>4. an AI-marked reflection task,
    <br>5. a spaced revision reminder if accuracy stays below 80%.
  `;
});

betaForm.addEventListener("click", (event) => {
  if (!event.target.matches("button")) return;

  const codeInput = betaForm.querySelector('input[type="text"]');
  const code = codeInput.value.trim().toUpperCase();

  if (!code) {
    codeInput.focus();
    codeInput.placeholder = "Enter a beta code first";
    return;
  }

  event.target.textContent = code.startsWith("FARSAH") ? "Access validated" : "Code queued for review";
});
