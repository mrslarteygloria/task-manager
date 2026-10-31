const KEY = "campus-pinboard-tasks-v1";
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const courseInput = document.querySelector("#task-course");
const taskGrid = document.querySelector("#task-grid");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const formError = document.querySelector("#form-error");
const openCount = document.querySelector("#open-count");
const doneCount = document.querySelector("#done-count");
const allCount = document.querySelector("#all-count");
const footerCount = document.querySelector("#footer-count");
const clearButton = document.querySelector("#clear-completed");
const filters = [...document.querySelectorAll(".filter")];
let tasks = readTasks();
let filter = "all";

function valid(item) { return item && typeof item.id === "string" && typeof item.title === "string" && typeof item.course === "string" && typeof item.done === "boolean"; }
function readTasks() { try { const data = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(data) ? data.filter(valid) : []; } catch { return []; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {} }
function makeCard(task) {
  const card = document.createElement("li"); card.className = `task-card${task.done ? " is-complete" : ""}`;
  const copy = document.createElement("div"); copy.className = "task-copy"; const title = document.createElement("p"); title.className = "task-title"; title.textContent = task.title; copy.append(title);
  if (task.course) { const course = document.createElement("p"); course.className = "task-course"; course.textContent = task.course; copy.append(course); }
  const actions = document.createElement("div"); actions.className = "card-actions";
  const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "task-toggle"; toggle.textContent = task.done ? "↶ Reopen" : "✓ Done"; toggle.setAttribute("aria-label", `${task.done ? "Reopen" : "Mark done"}: ${task.title}`); toggle.setAttribute("aria-pressed", String(task.done)); toggle.addEventListener("click", () => { task.done = !task.done; save(); render(); });
  const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-button"; remove.textContent = "×"; remove.setAttribute("aria-label", `Remove ${task.title}`); remove.addEventListener("click", () => { tasks = tasks.filter((entry) => entry.id !== task.id); save(); render(); });
  actions.append(toggle, remove); card.append(copy, actions); return card;
}
function render() {
  const shown = tasks.filter((task) => filter === "all" || (filter === "active" ? !task.done : task.done)); const open = tasks.filter((task) => !task.done).length; const done = tasks.length - open;
  taskGrid.replaceChildren(...shown.map(makeCard)); emptyState.hidden = shown.length > 0; openCount.textContent = String(open); doneCount.textContent = String(done); allCount.textContent = String(tasks.length); footerCount.textContent = `${tasks.length} ${tasks.length === 1 ? "PIN" : "PINS"}`; clearButton.hidden = done === 0;
  if (tasks.length && !shown.length) { emptyTitle.textContent = filter === "active" ? "All caught up!" : "No finished pins yet"; emptyCopy.textContent = filter === "active" ? "Nothing left in the open list." : "Finished tasks will show up here."; } else { emptyTitle.textContent = "Nothing pinned yet"; emptyCopy.textContent = "Add a task above. Your study list starts here."; }
}
function updateFilters() { filters.forEach((button) => { const selected = button.dataset.filter === filter; button.classList.toggle("is-active", selected); button.setAttribute("aria-pressed", String(selected)); }); }
form.addEventListener("submit", (event) => { event.preventDefault(); const title = titleInput.value.trim(); if (!title) { formError.hidden = false; titleInput.setAttribute("aria-invalid", "true"); titleInput.focus(); return; } tasks.unshift({ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, title, course: courseInput.value.trim(), done: false }); save(); form.reset(); formError.hidden = true; titleInput.removeAttribute("aria-invalid"); filter = "all"; updateFilters(); render(); titleInput.focus(); });
titleInput.addEventListener("input", () => { if (titleInput.value.trim()) { formError.hidden = true; titleInput.removeAttribute("aria-invalid"); } });
filters.forEach((button) => button.addEventListener("click", () => { filter = button.dataset.filter; updateFilters(); render(); }));
clearButton.addEventListener("click", () => { tasks = tasks.filter((task) => !task.done); save(); render(); });
document.querySelector("#today-label").textContent = `CAMPUS NOTES / ${new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date()).toUpperCase()}`;
render();