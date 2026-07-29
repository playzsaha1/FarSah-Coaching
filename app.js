const coachButton = document.querySelector("#coachButton");
const topicInput = document.querySelector("#topicInput");
const levelInput = document.querySelector("#levelInput");

coachButton?.addEventListener("click", () => {
  const topic = topicInput.value.trim() || "your selected topic";
  const level = levelInput.value;

  document.querySelector("#coachOutput").innerHTML = `
    <strong>${topic}</strong><br>
    Quest plan for <strong>${level}</strong>:
    <br>1. warm-up recap,
    <br>2. worked example with trap alerts,
    <br>3. adaptive practice streak,
    <br>4. AI-marked reflection,
    <br>5. revision reminder if accuracy stays under 80%.
  `;
});
