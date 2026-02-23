const taskinput = document.getElementById("taskinput");
const addbutton = document.getElementById("addbutton");
const tasklist = document.getElementById("tasklist");

const key = "todo_tasks";
let tasks = [];

function save() {
  localStorage.setItem(key, JSON.stringify(tasks));
}

function show() {
  tasklist.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      save();
      show();
    });

    const text = document.createElement("span");
    text.className = task.done ? "text done" : "text";
    text.textContent = task.text;

    const delbutton = document.createElement("button");
    delbutton.type = "button";
    delbutton.className = "delbutton";
    delbutton.textContent = "Delete";
    delbutton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      save();
      show();
    });

    li.append(checkbox, text, delbutton);
    tasklist.append(li);
  });
}

function add() {
  const text = taskinput.value.trim();

  if (!text) {
    return;
  }

  tasks.push({
    id: Date.now(),
    text,
    done: false
  });

  taskinput.value = "";
  save();
  show();
}

function load() {
  const data = localStorage.getItem(key);

  if (!data) {
    tasks = [];
    return;
  }

  try {
    const parsed = JSON.parse(data);
    tasks = Array.isArray(parsed) ? parsed : [];
  } catch {
    tasks = [];
  }
}

addbutton.addEventListener("click", add);
taskinput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    add();
  }
});

load();
show();
