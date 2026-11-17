import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "https://fiiivhvewfixawkrvnxr.supabase.co",
    "sb_publishable_3KLu0LjaN9T7dtpXgiwbWQ_L3_ZbkGF"
);

// Load all published portfolio information
async function loadPortfolio() {

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Portfolio loading error:", error);
        return;
    }

    const categories = {
        about: "publicAbout",
        skill: "publicSkills",
        project: "publicProjects",
        experience: "publicExperience",
        education: "publicEducation",
        certificate: "publicCertificates",
        achievement: "publicAchievements",
        contact: "publicContact"
    };

    // Clear previous content
    Object.values(categories).forEach(id => {
        const element = document.getElementById(id);
        if (element) element.replaceChildren();
    });

    // Clear social links
    const socialContainer = document.getElementById("socialLinks");

    if (socialContainer) {
        socialContainer.replaceChildren();
    }

    // Statistics
    const counts = {
        project: 0,
        certificate: 0,
        skill: 0,
        experience: 0
    };

    // Display portfolio items
    data.forEach(item => {

        // Update statistics
        if (counts[item.category] !== undefined) {
            counts[item.category]++;
        }

        // Dynamic Profile
        if (item.category === "profile") {

            const name = document.getElementById("heroName");
            const subtitle = document.getElementById("heroSubtitle");
            const description = document.getElementById("heroDescription");

            if (name) name.textContent = item.title;
            if (subtitle) subtitle.textContent = item.subtitle || "";
            if (description) description.textContent = item.description || "";

            return;
        }

        // Dynamic Social Links
        // Dynamic Social Links with Brand Logos
if (item.category === "social") {

    const socialContainer =
        document.getElementById("socialLinks");

    const socialIcons = {
        instagram: "https://cdn.simpleicons.org/instagram",
        twitter: "https://cdn.simpleicons.org/x",
        x: "https://cdn.simpleicons.org/x",
        whatsapp: "https://cdn.simpleicons.org/whatsapp",
        linkedin: "https://cdn.simpleicons.org/linkedIn/0A66C2",
        github: "https://cdn.simpleicons.org/github"
    };

    const platform = item.title.toLowerCase().trim();
    const iconUrl = socialIcons[platform];

    if (socialContainer && item.link_url && iconUrl) {

        const link = document.createElement("a");
        link.href = item.link_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "social-icon";
        link.setAttribute("aria-label", item.title);

        const icon = document.createElement("img");
        icon.src = iconUrl;
        icon.alt = item.title;

        link.appendChild(icon);
        socialContainer.appendChild(link);
    }

    return;
}
// Get category container
const containerId = categories[item.category];

if (!containerId) return;

const container = document.getElementById(containerId);

if (!container) return;

        // Skills
        if (item.category === "skill") {

            const skill = document.createElement("span");
            skill.textContent = item.title;

            container.appendChild(skill);
            return;
        }

        // Portfolio Cards
        const card = document.createElement("article");
        card.className = "portfolio-card";

        // Project image
        if (item.category === "project" && item.file_url) {

            const image = document.createElement("img");
            image.src = item.file_url;
            image.alt = item.title;
            image.className = "project-image";

            card.appendChild(image);
        }

        // Title
        const title = document.createElement("h3");
        title.textContent = item.title;

        // Subtitle
        const subtitle = document.createElement("p");
        subtitle.className = "card-subtitle";
        subtitle.textContent = item.subtitle || "";

        // Description
        const description = document.createElement("p");
        description.textContent = item.description || "";

        card.append(title, subtitle, description);

        // Date
        if (item.date_text) {

            const date = document.createElement("p");
            date.textContent = item.date_text;

            card.appendChild(date);
        }

        // Uploaded file
        if (item.file_url && item.category !== "project") {

            const file = document.createElement("a");
            file.href = item.file_url;
            file.target = "_blank";
            file.rel = "noopener noreferrer";

            file.textContent =
                item.category === "certificate"
                    ? "View Certificate"
                    : "View Document";

            card.appendChild(file);
        }

        // External link
        if (item.link_url) {

            const link = document.createElement("a");
            link.href = item.link_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.textContent =
                item.category === "project"
                    ? "View Project →"
                    : "View More →";

            card.appendChild(link);
        }

        container.appendChild(card);

    });

    // Update homepage statistics
    const projectCount = document.getElementById("projectCount");
    const certificateCount = document.getElementById("certificateCount");
    const skillCount = document.getElementById("skillCount");
    const experienceCount = document.getElementById("experienceCount");

    if (projectCount) projectCount.textContent = counts.project;
    if (certificateCount) certificateCount.textContent = counts.certificate;
    if (skillCount) skillCount.textContent = counts.skill;
    if (experienceCount) experienceCount.textContent = counts.experience;

}

// Load portfolio
loadPortfolio();
// Contact Form
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const button = document.getElementById("sendMessage");
        const status = document.getElementById("contactStatus");

        button.disabled = true;
        button.textContent = "Sending...";

        const { error } = await supabase
            .from("contact_messages")
            .insert([{
                name: document.getElementById("contactName").value.trim(),
                email: document.getElementById("contactEmail").value.trim(),
                subject: document.getElementById("contactSubject").value.trim(),
                message: document.getElementById("contactMessage").value.trim()
            }]);

        if (error) {
            status.textContent = "Message could not be sent. Please try again.";
        } else {
            status.textContent = "Message sent successfully!";
            contactForm.reset();
        }

        button.disabled = false;
        button.textContent = "Send Message";
    });
}
