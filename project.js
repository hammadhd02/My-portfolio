import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase connection
const supabase = createClient(
    "https://fiiivhvewfixawkrvnxr.supabase.co",
    "sb_publishable_3KLu0LjaN9T7dtpXgiwbWQ_L3_ZbkGF"
);

// Get project container
const projectContainer = document.getElementById("publicProjects");

// Load published projects
async function loadProjects() {

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("category", "project")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    if (error) {
        projectContainer.textContent = "Unable to load projects.";
        console.error(error);
        return;
    }

    projectContainer.replaceChildren();

    if (data.length === 0) {
        projectContainer.textContent = "Projects coming soon!";
        return;
    }

    data.forEach(project => {

        const card = document.createElement("div");
        card.className = "public-project-card";

        const title = document.createElement("h3");
        title.textContent = project.title;

        const description = document.createElement("p");
        description.textContent = project.description || "";

        card.append(title, description);

        if (project.link_url) {
            const link = document.createElement("a");
            link.href = project.link_url;
            link.textContent = "View Project";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            card.appendChild(link);
        }

        projectContainer.appendChild(card);
    });
}

loadProjects();