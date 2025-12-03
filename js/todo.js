/* -----------------------------------------------------------
    JavaScript für persönliche Portfolio-Seite
    Autor: Zoltan Ress
    Datum: 2025-12-03
----------------------------------------------------------- */

// Elemente
const input = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("todo-list");
const darkToggle = document.getElementById("darkmode-toggle");

// Daten
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Dark Mode laden
if (localStorage.getItem("dark") === "true") {
    document.body.classList.add("dark");
}

// Initial render
renderList(false);

// ---------------- Add Todo ----------------
addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    const newTodo = { id: Date.now(), text, done: false };
    todos.push(newTodo);
    input.value = "";
    save();
    renderList(true); // spiele Einblend-Animation
});

// Enter zum Hinzufügen
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
});

// ---------------- Render List ----------------
function renderList(animateAll = false) {
    // Clear
    list.innerHTML = "";

    // Für jedes Todo DOM-Element bauen
    todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.draggable = true;
    li.dataset.id = todo.id;

    // Bei neuer Hinzufügung: markiere für Animation
    if (animateAll) li.classList.add("added");

    li.innerHTML = `
        <div class="todo-left">
        <input type="checkbox" class="check" ${todo.done ? "checked" : ""} />
        <span class="todo-text ${todo.done ? "done" : ""}"></span>
        </div>
        <button class="delete-btn" aria-label="Löschen">×</button>
    `;
    li.querySelector(".todo-text").textContent = todo.text;

    // Drag-Event-Handler pro Item
    li.addEventListener("dragstart", (e) => {
        li.classList.add("dragging");
        // Set dataTransfer (not strictly necessary but some browsers require it)
        e.dataTransfer?.setData("text/plain", String(todo.id));
    });
    li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        // Nach Ende: neue Reihenfolge speichern
        saveNewOrder();
    });

    // Anhängen
    list.appendChild(li);
    });
}

// ---------------- Event-Delegation für Checkbox & Delete ----------------
list.addEventListener("click", (e) => {
    // Checkbox geklickt?
    if (e.target.classList.contains("check")) {
        const li = e.target.closest(".todo-item");
        if (!li) return;
        const id = Number(li.dataset.id);
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        todo.done = e.target.checked;
        save();
        // kein vollständiges Neurendern nötig, aktualisiere nur Klassen
        const textEl = li.querySelector(".todo-text");
        if (todo.done) textEl.classList.add("done"); else textEl.classList.remove("done");
        return;
    }

    // Delete gedrückt?
    if (e.target.classList.contains("delete-btn")) {
        const li = e.target.closest(".todo-item");
        if (!li) return;
        const id = Number(li.dataset.id);
        // Animiert entfernen
        li.classList.add("removed");
        // kurz warten und dann in Daten entfernen + Neurendern
        setTimeout(() => {
            todos = todos.filter(t => t.id !== id);
            save();
            renderList();
        }, 250);
    }
});

// ---------------- Drag & Drop Listeners (einmal registrieren) ----------------
list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    const afterElement = getDragAfterElement(e.clientY);
    if (afterElement == null) {
        list.appendChild(dragging);
    } else {
        list.insertBefore(dragging, afterElement);
    }
});

// Hilfsfunktion: nächstes Element unter Maus finden
function getDragAfterElement(y) {
    const draggableElements = [...list.querySelectorAll(".todo-item:not(.dragging)")];
    let closest = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    draggableElements.forEach(child => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    // offset < 0 bedeutet Maus über Mitte des Elements -> möglicher Insert-Punkt
    if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closest = child;
    }
    });

    return closest;
}

// Neue Reihenfolge aus DOM in todos übernehmen
function saveNewOrder() {
    const newOrder = [...list.querySelectorAll(".todo-item")].map(li => {
        const id = Number(li.dataset.id);
        return todos.find(t => t.id === id);
    }).filter(Boolean);
    todos = newOrder;
    save();
}

// ---------------- Storage & DarkMode ----------------
function save() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("dark", document.body.classList.contains("dark"));
});