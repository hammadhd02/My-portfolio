import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "https://fiiivhvewfixawkrvnxr.supabase.co",
    "sb_publishable_3KLu0LjaN9T7dtpXgiwbWQ_L3_ZbkGF"
);

async function loadMessages() {

    const status = document.getElementById("messagesStatus");
    const container = document.getElementById("messagesList");

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
        window.location.href = "admin.html";
        return;
    }

    const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        status.textContent = "Unable to load messages.";
        return;
    }

    container.replaceChildren();

    const unread = data.filter(message => !message.is_read).length;

    status.textContent =
        `${data.length} messages | ${unread} unread`;

    if (data.length === 0) {
        container.textContent = "No messages yet.";
        return;
    }

    data.forEach(message => {

        const card = document.createElement("article");
        card.className = "portfolio-card";

        const name = document.createElement("h3");
        name.textContent = message.name;

        const email = document.createElement("p");
        email.textContent = message.email;

        const subject = document.createElement("h4");
        subject.textContent = message.subject;

        const content = document.createElement("p");
        content.textContent = message.message;

        const date = document.createElement("small");
        date.textContent =
            new Date(message.created_at).toLocaleString();

        const badge = document.createElement("p");
        badge.textContent = message.is_read ? "✓ Read" : "● Unread";

        const readButton = document.createElement("button");
        readButton.textContent =
            message.is_read ? "Mark Unread" : "Mark as Read";

        readButton.addEventListener("click", async () => {

            const { error } = await supabase
                .from("contact_messages")
                .update({ is_read: !message.is_read })
                .eq("id", message.id);

            if (error) {
                alert("Unable to update message.");
                console.error(error);
                return;
            }

            loadMessages();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Message";

        deleteButton.addEventListener("click", async () => {

            if (!confirm("Are you sure you want to delete this message?")) {
                return;
            }

            const { error } = await supabase
                .from("contact_messages")
                .delete()
                .eq("id", message.id);

            if (error) {
                alert("Unable to delete message.");
                console.error(error);
                return;
            }

            loadMessages();
        });

        card.append(
            name,
            email,
            subject,
            content,
            date,
            badge,
            readButton,
            deleteButton
        );

        container.appendChild(card);
    });
}

loadMessages();