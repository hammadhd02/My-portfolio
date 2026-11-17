import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
"https://fiiivhvewfixawkrvnxr.supabase.co",
    "sb_publishable_3KLu0LjaN9T7dtpXgiwbWQ_L3_ZbkGF"
);
// Elements
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("adminDashboard");
const contentForm = document.getElementById("contentForm");
const contentList = document.getElementById("contentList");

let currentUser = null;
let category = "project";

// REQUIRE LOGIN WHEN ADMIN PAGE OPENS
async function requireFreshLogin() {
    loginSection.hidden = false;
    dashboard.hidden = true;

    const { error } = await supabase.auth.signOut({
        scope: "local"
    });

    if (error) {
        console.error("Sign out error:", error.message);
    }

    currentUser = null;
}

requireFreshLogin();

// LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("message");
    message.textContent = "Signing in...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    currentUser = data.user;
    message.textContent = "";

    showDashboard();
});

// SHOW DASHBOARD
function showDashboard() {
    loginSection.hidden = true;
    dashboard.hidden = false;

    showOverview();
}


// SIDEBAR NAVIGATION
document.querySelectorAll("[data-category]").forEach(button => {

    button.addEventListener("click", () => {

        category = button.dataset.category;

        if (category === "overview") {
            showOverview();
        } else {
            showManager();
        }
    });
});


// OVERVIEW
async function showOverview() {

    document.getElementById("overviewSection").hidden = false;
    document.getElementById("managerSection").hidden = true;

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("category");

    const statistics = document.getElementById("statistics");

    if (error) {
        statistics.textContent = error.message;
        return;
    }

    statistics.replaceChildren();

    const categories = [
        "project", "skill", "experience", "education",
        "certificate", "achievement", "social",
        "about", "contact"
    ];

    categories.forEach(type => {

        const count = data.filter(item =>
            item.category === type
        ).length;

        const card = document.createElement("div");
        card.className = "admin-card";

        const heading = document.createElement("h3");
        heading.textContent =
            type.charAt(0).toUpperCase() + type.slice(1);

        const number = document.createElement("h2");
        number.textContent = count;

        card.append(heading, number);
        statistics.appendChild(card);
    });
}


// OPEN MANAGER
function showManager() {

    document.getElementById("overviewSection").hidden = true;
    document.getElementById("managerSection").hidden = false;

    document.getElementById("managerTitle").textContent =
        "Manage " + category.charAt(0).toUpperCase() +
        category.slice(1) + "s";

    clearForm();
    loadItems();
}


// CLEAR FORM
function clearForm() {

    contentForm.reset();
    document.getElementById("itemId").value = "";
    document.getElementById("published").checked = true;
}


// LOAD CONTENT
async function loadItems() {

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

    if (error) {
        contentList.textContent = error.message;
        return;
    }

    contentList.replaceChildren();

    data.forEach(item => {

        const card = document.createElement("div");
        card.className = "project-item";

        const title = document.createElement("h3");
        title.textContent = item.title;

        const subtitle = document.createElement("p");
        subtitle.textContent = item.subtitle || "";

        const description = document.createElement("p");
        description.textContent = item.description || "";

        const status = document.createElement("p");
        status.textContent = item.is_published
            ? "Published"
            : "Unpublished";

        const edit = document.createElement("button");
        edit.textContent = "Edit";

        edit.onclick = () => editItem(item);

        const remove = document.createElement("button");
        remove.textContent = "Delete";

        remove.onclick = () => deleteItem(item.id);

        const toggle = document.createElement("button");
        toggle.textContent = item.is_published
            ? "Unpublish"
            : "Publish";

        toggle.onclick = () => togglePublish(item);

        card.append(
            title, subtitle, description,
            status, edit, remove, toggle
        );

        contentList.appendChild(card);
    });
}


// ADD OR UPDATE
contentForm.addEventListener("submit", async event => {

    event.preventDefault();

    if (!currentUser) return;

    const id = document.getElementById("itemId").value;

    let fileUrl = null;

    const file = document.getElementById("fileInput").files[0];

    if (file) {

        const allowedTypes = [
            "image/jpeg", "image/png", "image/webp",
            "application/pdf"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG, WEBP and PDF files are allowed.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Maximum file size is 10 MB.");
            return;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${currentUser.id}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
            .from("portfolio-files")
            .upload(path, file);

        if (uploadError) {
            alert(uploadError.message);
            return;
        }

        const { data } = supabase.storage
            .from("portfolio-files")
            .getPublicUrl(path);

        fileUrl = data.publicUrl;
    }

    const record = {
        user_id: currentUser.id,
        category,
        title: document.getElementById("title").value,
        subtitle: document.getElementById("subtitle").value,
        description: document.getElementById("description").value,
        date_text: document.getElementById("dateText").value,
        link_url: document.getElementById("linkUrl").value,
        is_published: document.getElementById("published").checked
    };

    if (fileUrl) {
        record.file_url = fileUrl;
    }

    let result;

    if (id) {

        result = await supabase
            .from("portfolio_items")
            .update(record)
            .eq("id", id);

    } else {

        result = await supabase
            .from("portfolio_items")
            .insert(record);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    alert("Information saved successfully!");

    clearForm();
    loadItems();
    showOverview();
});


// EDIT
function editItem(item) {

    document.getElementById("itemId").value = item.id;
    document.getElementById("title").value = item.title;
    document.getElementById("subtitle").value = item.subtitle || "";
    document.getElementById("description").value = item.description || "";
    document.getElementById("dateText").value = item.date_text || "";
    document.getElementById("linkUrl").value = item.link_url || "";
    document.getElementById("published").checked = item.is_published;

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// DELETE
async function deleteItem(id) {

    if (!confirm("Are you sure you want to delete this item?")) return;

    const { error } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadItems();
    showOverview();
}


// PUBLISH / UNPUBLISH
async function togglePublish(item) {

    const { error } = await supabase
        .from("portfolio_items")
        .update({ is_published: !item.is_published })
        .eq("id", item.id);

    if (error) {
        alert(error.message);
        return;
    }

    loadItems();
}


// CLEAR BUTTON
document.getElementById("cancelEdit").onclick = clearForm;


// EXISTING SESSION
const { data: sessionData } = await supabase.auth.getSession();

if (sessionData.session) {

    currentUser = sessionData.session.user;
    showDashboard();
}


// LOGOUT
document.getElementById("logoutButton").onclick = async () => {

    await supabase.auth.signOut();

    currentUser = null;
    dashboard.hidden = true;
    loginSection.hidden = false;
};