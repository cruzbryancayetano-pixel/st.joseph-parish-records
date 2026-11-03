
"use strict";

/* STORAGE */

function loadData(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

let parishioners = loadData("parishioners");
let sacraments = loadData("sacraments");
let requests = loadData("requests");
let appointments = loadData("appointments");

function saveData() {
    localStorage.setItem("parishioners", JSON.stringify(parishioners));
    localStorage.setItem("sacraments", JSON.stringify(sacraments));
    localStorage.setItem("requests", JSON.stringify(requests));
    localStorage.setItem("appointments", JSON.stringify(appointments));
}

function nextId(records) {
    return records.length
        ? Math.max(...records.map(item => Number(item.id) || 0)) + 1
        : 1;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[char]);
}

function formatDate(value) {
    if (!value) return "—";
    const parts = value.split("-");
    return parts.length === 3
        ? `${parts[1]}/${parts[2]}/${parts[0]}`
        : escapeHTML(value);
}

function getValue(id) {
    return document.getElementById(id).value.trim();
}

/* NAVIGATION */

const pageTitles = {
    dashboard: "Dashboard",
    parishioners: "Parishioner Records",
    sacraments: "Sacramental Records",
    requests: "Document Requests",
    appointments: "Appointments"
};

function showPage(pageName) {
    if (!pageTitles[pageName]) return;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("hidden", page.id !== pageName);
    });

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageName);
    });

    document.getElementById("pageTitle").textContent = pageTitles[pageName];
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.go));
});

/* DASHBOARD */

function updateDashboard() {
    document.getElementById("countParishioners").textContent = parishioners.length;
    document.getElementById("countSacraments").textContent = sacraments.length;
    document.getElementById("countRequests").textContent = requests.length;
    document.getElementById("countAppointments").textContent = appointments.length;
}

/* PARISHIONERS */

function renderParishioners() {
    const query = getValue("searchParishioners").toLowerCase();

    const filtered = parishioners.filter(person =>
        [person.name, person.birth, person.contact, person.address]
            .some(value => String(value || "").toLowerCase().includes(query))
    );

    const tbody = document.getElementById("tableParishioners");

    tbody.innerHTML = filtered.length ? filtered.map(person => `
        <tr>
            <td>P-${person.id}</td>
            <td>${escapeHTML(person.name)}</td>
            <td>${formatDate(person.birth)}</td>
            <td>${escapeHTML(person.contact || "—")}</td>
            <td>${escapeHTML(person.address || "—")}</td>
            <td><button class="action-button delete"
                data-delete="parishioners" data-id="${person.id}">Delete</button></td>
        </tr>
    `).join("") : '<tr><td colspan="6" class="empty-row">No parishioner records found.</td></tr>';
}

document.getElementById("formParishioner").addEventListener("submit", event => {
    event.preventDefault();

    parishioners.push({
        id: nextId(parishioners),
        name: getValue("pName"),
        birth: getValue("pBirth"),
        contact: getValue("pContact"),
        address: getValue("pAddress")
    });

    saveData();
    event.target.reset();
    renderAll();
    alert("Parishioner record saved.");
});

document.getElementById("searchParishioners").addEventListener("input", renderParishioners);

/* SACRAMENTS */

function renderSacraments() {
    const query = getValue("searchSacraments").toLowerCase();

    const filtered = sacraments.filter(record =>
        [record.name, record.type, record.date, record.details]
            .some(value => String(value || "").toLowerCase().includes(query))
    );

    const tbody = document.getElementById("tableSacraments");

    tbody.innerHTML = filtered.length ? filtered.map(record => `
        <tr>
            <td>S-${record.id}</td>
            <td>${escapeHTML(record.name)}</td>
            <td>${escapeHTML(record.type)}</td>
            <td>${formatDate(record.date)}</td>
            <td>${escapeHTML(record.details || "—")}</td>
            <td><button class="action-button delete"
                data-delete="sacraments" data-id="${record.id}">Delete</button></td>
        </tr>
    `).join("") : '<tr><td colspan="6" class="empty-row">No sacramental records found.</td></tr>';
}

document.getElementById("formSacrament").addEventListener("submit", event => {
    event.preventDefault();

    sacraments.push({
        id: nextId(sacraments),
        name: getValue("sName"),
        type: getValue("sType"),
        date: getValue("sDate"),
        details: getValue("sDetails")
    });

    saveData();
    event.target.reset();
    renderAll();
    alert("Sacramental record saved.");
});

document.getElementById("searchSacraments").addEventListener("input", renderSacraments);

/* DOCUMENT REQUESTS */

function renderRequests() {
    const query = getValue("searchRequests").toLowerCase();

    const filtered = requests.filter(request =>
        [request.name, request.type, request.date, request.purpose, request.status]
            .some(value => String(value || "").toLowerCase().includes(query))
    );

    const tbody = document.getElementById("tableRequests");

    tbody.innerHTML = filtered.length ? filtered.map(request => `
        <tr>
            <td>R-${request.id}</td>
            <td>${escapeHTML(request.name)}</td>
            <td>${escapeHTML(request.type)}</td>
            <td>${formatDate(request.date)}</td>
            <td>${escapeHTML(request.purpose || "—")}</td>
            <td><span class="status ${request.status === "Completed" ? "complete" : ""}">
                ${escapeHTML(request.status)}</span></td>
            <td>
                ${request.status !== "Completed" ? `<button class="action-button"
                    data-complete="${request.id}">Complete</button>` : ""}
                <button class="action-button delete"
                    data-delete="requests" data-id="${request.id}">Delete</button>
            </td>
        </tr>
    `).join("") : '<tr><td colspan="7" class="empty-row">No document requests found.</td></tr>';
}

document.getElementById("formRequest").addEventListener("submit", event => {
    event.preventDefault();

    requests.push({
        id: nextId(requests),
        name: getValue("rName"),
        type: getValue("rType"),
        date: getValue("rDate"),
        purpose: getValue("rPurpose"),
        status: "Pending"
    });

    saveData();
    event.target.reset();
    renderAll();
    alert("Document request saved.");
});

document.getElementById("searchRequests").addEventListener("input", renderRequests);

/* APPOINTMENTS */

function renderAppointments() {
    const query = getValue("searchAppointments").toLowerCase();

    const filtered = appointments.filter(appointment =>
        [appointment.name, appointment.purpose, appointment.date,
         appointment.time, appointment.status]
            .some(value => String(value || "").toLowerCase().includes(query))
    );

    const tbody = document.getElementById("tableAppointments");

    tbody.innerHTML = filtered.length ? filtered.map(appointment => `
        <tr>
            <td>A-${appointment.id}</td>
            <td>${escapeHTML(appointment.name)}</td>
            <td>${escapeHTML(appointment.purpose)}</td>
            <td>${formatDate(appointment.date)}</td>
            <td>${escapeHTML(appointment.time)}</td>
            <td><span class="status ${appointment.status === "Confirmed" ? "complete" : ""}">
                ${escapeHTML(appointment.status)}</span></td>
            <td>
                ${appointment.status !== "Confirmed" ? `<button class="action-button"
                    data-confirm="${appointment.id}">Confirm</button>` : ""}
                <button class="action-button delete"
                    data-delete="appointments" data-id="${appointment.id}">Delete</button>
            </td>
        </tr>
    `).join("") : '<tr><td colspan="7" class="empty-row">No appointments found.</td></tr>';
}

document.getElementById("formAppointment").addEventListener("submit", event => {
    event.preventDefault();

    appointments.push({
        id: nextId(appointments),
        name: getValue("aName"),
        purpose: getValue("aPurpose"),
        date: getValue("aDate"),
        time: getValue("aTime"),
        status: "Pending"
    });

    saveData();
    event.target.reset();
    renderAll();
    alert("Appointment saved.");
});

document.getElementById("searchAppointments").addEventListener("input", renderAppointments);

/* DELETE, COMPLETE, AND CONFIRM */

document.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-delete]");

    if (deleteButton) {
        const key = deleteButton.dataset.delete;
        const id = Number(deleteButton.dataset.id);

        if (!confirm("Are you sure you want to delete this record?")) return;

        if (key === "parishioners") {
            parishioners = parishioners.filter(item => item.id !== id);
        } else if (key === "sacraments") {
            sacraments = sacraments.filter(item => item.id !== id);
        } else if (key === "requests") {
            requests = requests.filter(item => item.id !== id);
        } else if (key === "appointments") {
            appointments = appointments.filter(item => item.id !== id);
        }

        saveData();
        renderAll();
        return;
    }

    const completeButton = event.target.closest("[data-complete]");

    if (completeButton) {
        const request = requests.find(
            item => item.id === Number(completeButton.dataset.complete)
        );

        if (request) {
            request.status = "Completed";
            saveData();
            renderAll();
        }
        return;
    }

    const confirmButton = event.target.closest("[data-confirm]");

    if (confirmButton) {
        const appointment = appointments.find(
            item => item.id === Number(confirmButton.dataset.confirm)
        );

        if (appointment) {
            appointment.status = "Confirmed";
            saveData();
            renderAll();
        }
    }
});

/* ACCOUNT REGISTRATION AND LOGIN */

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const guestButton = document.getElementById("guestButton");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const app = document.getElementById("app");
const userStatus = document.getElementById("userStatus");
const logoutButton = document.getElementById("logoutButton");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const switchText = document.getElementById("switchText");
const switchAuthButton = document.getElementById("switchAuthButton");

let authMode = "login";

function getAccounts() {
    try {
        const accounts = JSON.parse(localStorage.getItem("demoAccounts") || "[]");
        return Array.isArray(accounts) ? accounts : [];
    } catch {
        return [];
    }
}

function showAuthError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
}

function showAuthMode(mode) {
    authMode = mode;

    loginForm.classList.toggle("hidden", mode !== "login");
    registerForm.classList.toggle("hidden", mode !== "register");

    loginError.classList.add("hidden");
    registerError.classList.add("hidden");

    authTitle.textContent = mode === "login"
        ? "Parish Management System"
        : "Create an Account";

    authDescription.textContent = mode === "login"
        ? "Sign in to access the parish management system."
        : "Register a demonstration account to get started.";

    switchText.textContent = mode === "login"
        ? "Don't have an account?"
        : "Already have an account?";

    switchAuthButton.textContent = mode === "login"
        ? "Create Account"
        : "Log In";

    guestButton.classList.toggle("hidden", mode !== "login");
}

switchAuthButton.addEventListener("click", () => {
    showAuthMode(authMode === "login" ? "register" : "login");
});

function enterSystem(displayName, role) {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    userStatus.textContent = role === "guest"
        ? "Guest Mode"
        : displayName + (role === "admin" ? " (Admin)" : " (User)");

    showPage("dashboard");
    renderAll();
}

/* CREATE ACCOUNT */

registerForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = getValue("registerName");
    const username = getValue("registerUsername");
    const password = document.getElementById("registerPassword").value;
    const confirmation = document.getElementById("confirmPassword").value;

    if (name.length < 2) {
        showAuthError(registerError, "Please enter your full name.");
        return;
    }

    if (username.length < 3) {
        showAuthError(registerError, "Username must be at least 3 characters.");
        return;
    }

    if (password.length < 6) {
        showAuthError(registerError, "Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmation) {
        showAuthError(registerError, "Passwords do not match.");
        return;
    }

    const accounts = getAccounts();

    if (accounts.some(account =>
        account.username.toLowerCase() === username.toLowerCase()
    )) {
        showAuthError(registerError, "That username is already taken.");
        return;
    }

    // Local demo only: never store real passwords this way.
    accounts.push({
        name,
        username,
        password,
        role: "user"
    });

    try {
        localStorage.setItem("demoAccounts", JSON.stringify(accounts));
    } catch {
        showAuthError(registerError, "Could not save the account in this browser.");
        return;
    }

    registerForm.reset();
    loginForm.reset();
    showAuthMode("login");
    document.getElementById("loginUsername").value = username;

    showAuthError(loginError, "Account created! You can now log in.");
});

/* LOG IN */

loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const username = getValue("loginUsername");
    const password = document.getElementById("loginPassword").value;

    // Demonstration administrator credentials
    if (username === "admin" && password === "parish123") {
        enterSystem("Demo Administrator", "admin");
        return;
    }

    const account = getAccounts().find(item =>
        item.username.toLowerCase() === username.toLowerCase() &&
        item.password === password
    );

    if (account) {
        enterSystem(account.name, account.role);
    } else {
        showAuthError(loginError, "Incorrect username or password.");
    }
});

/* GUEST MODE */

guestButton.addEventListener("click", () => {
    enterSystem("Guest", "guest");
});

/* LOG OUT */

logoutButton.addEventListener("click", () => {
    app.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    loginForm.reset();
    registerForm.reset();
    showAuthMode("login");
});

/* INITIALIZE */

function renderAll() {
    renderParishioners();
    renderSacraments();
    renderRequests();
    renderAppointments();
    updateDashboard();
}

showAuthMode("login");
showPage("dashboard");
renderAll();

