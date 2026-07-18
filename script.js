let tasks = [];
let currentIndex = 0;
let onBreak = false;

// Page elements
const landingSection = document.getElementById("landingSection");
const setupSection = document.getElementById("setupSection");
const planSection = document.getElementById("planSection");
const warningSection = document.getElementById("warningSection");

const letsStartBtn = document.getElementById("letsStartBtn");

const taskInput = document.getElementById("taskInput");
const startTimeInput = document.getElementById("startTimeInput");
const endTimeInput = document.getElementById("endTimeInput");
const addBtn = document.getElementById("addBtn");
const arrangeBtn = document.getElementById("arrangeBtn");
const taskList = document.getElementById("taskList");
const startDayBtn = document.getElementById("startDayBtn");

const currentTaskName = document.getElementById("currentTaskName");
const currentTaskTime = document.getElementById("currentTaskTime");
const currentTaskStatus = document.getElementById("currentTaskStatus");
const taskCounter = document.getElementById("taskCounter");
const backBtn = document.getElementById("backBtn");
const okBackBtn = document.getElementById("okBackBtn");

// ===== Landing → Setup =====
letsStartBtn.addEventListener("click", () => {
  landingSection.classList.add("hidden");
  setupSection.classList.remove("hidden");
});

// ===== Add Task =====
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const start = startTimeInput.value;
  const end = endTimeInput.value;

  if (text === "" || start === "" || end === "") {
    alert("Please fill in task name, start time, and end time.");
    return;
  }

  tasks.push({ text, start, end, started: false, ended: false });
  taskInput.value = "";
  startTimeInput.value = "";
  endTimeInput.value = "";
  renderTaskList();
});

arrangeBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    alert("Add at least one task first!");
    return;
  }
  tasks.sort((a, b) => a.start.localeCompare(b.start));
  renderTaskList();
});

function renderTaskList() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = `${task.text} (${task.start} - ${task.end})`;
    taskList.appendChild(li);
  });
}

// ===== Start My Day =====
startDayBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    alert("Add at least one task first!");
    return;
  }

  tasks.sort((a, b) => a.start.localeCompare(b.start));
  currentIndex = 0;
  onBreak = false;

  setupSection.classList.add("hidden");
  planSection.classList.remove("hidden");

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  showCurrentTask();
  setInterval(checkTaskTimes, 15000);
});

// ===== Go Back button (mid-task warning) =====
backBtn.addEventListener("click", () => {
  const allDone = currentIndex >= tasks.length;

  if (allDone) {
    planSection.classList.add("hidden");
    setupSection.classList.remove("hidden");
  } else {
    planSection.classList.add("hidden");
    warningSection.classList.remove("hidden");
    document.body.classList.add("alert-mode");
  }
});

okBackBtn.addEventListener("click", () => {
  warningSection.classList.add("hidden");
  planSection.classList.remove("hidden");
  document.body.classList.remove("alert-mode");
});

// ===== Show current state =====
function showCurrentTask() {
  if (currentIndex >= tasks.length) {
    showCelebration();
    return;
  }

  const task = tasks[currentIndex];

  if (onBreak) {
    currentTaskName.textContent = "⏸ Time for Break";
    currentTaskTime.textContent = `Next: ${task.text} at ${task.start}`;
    currentTaskStatus.textContent = "Relax for a moment...";
    taskCounter.textContent = `Task ${currentIndex + 1} of ${tasks.length}`;
    return;
  }

  currentTaskName.textContent = task.text;
  currentTaskTime.textContent = `${task.start} → ${task.end}`;
  currentTaskStatus.textContent = task.started ? "In progress..." : "Waiting to start";
  taskCounter.textContent = `Task ${currentIndex + 1} of ${tasks.length}`;
}

// ===== Celebration screen =====
function showCelebration() {
  currentTaskName.innerHTML = `<span class="celebrate-text">🎉 All Tasks Done! Well done. 🎉</span>`;
  currentTaskTime.textContent = "";
  currentTaskStatus.textContent = "";
  taskCounter.textContent = "";

  document.body.classList.add("celebrate-mode");
  launchConfetti();
}

function launchConfetti() {
  const emojis = ["🎉", "🎊", "✨", "⭐", "🥳"];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const piece = document.createElement("div");
      piece.className = "confetti";
      piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.animationDuration = (2 + Math.random() * 2) + "s";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }, i * 100);
  }
}

// ===== Check times every 15 sec =====
function checkTaskTimes() {
  if (currentIndex >= tasks.length) return;

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const task = tasks[currentIndex];

  if (onBreak) {
    if (task.start <= currentTime) {
      onBreak = false;
      task.started = true;
      notifyUser(`▶ Start now: ${task.text}`);
      showCurrentTask();
    }
    return;
  }

  if (!task.started && task.start <= currentTime) {
    task.started = true;
    notifyUser(`▶ Start now: ${task.text}`);
    showCurrentTask();
  }

  if (!task.ended && task.end <= currentTime) {
    task.ended = true;
    notifyUser(`✅ Time's up: ${task.text}`);
    currentIndex++;

    if (currentIndex < tasks.length) {
      onBreak = true;
    }
    showCurrentTask();
  }
}

function notifyUser(message) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Priorly", { body: message });
  } else {
    alert(message);
  }
}