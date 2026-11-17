import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "YOUR_PROJECT_URL",
    "YOUR_PUBLISHABLE_KEY"
);

async function updateMessageBadge() {

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) return;

    const { count, error } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

    if (error) {
        console.error(error);
        return;
    }

    const badge = document.getElementById("messageBadge");

    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "inline-block" : "none";
    }
}

updateMessageBadge();