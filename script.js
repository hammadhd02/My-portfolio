// Select Private Panel elements
const panelButton = document.getElementById("panelButton");
const privatePanel = document.getElementById("privatePanel");

// Open and close Private Panel
panelButton.addEventListener("click", function () {

    if (privatePanel.style.display === "block") {
        privatePanel.style.display = "none";
    } else {
        privatePanel.style.display = "block";
    }

});
const menuToggle = document.getElementById("menuToggle");
const navigation = document.querySelector("header nav");

menuToggle.addEventListener("click", () => {
    navigation.classList.toggle("active");
});

// Close menu after selecting a link
navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navigation.classList.remove("active");
    });
});
const avatar = document.querySelector(".profile-avatar");
const avatarArea = document.querySelector(".hero-visual");

if (avatar && avatarArea) {
    avatarArea.addEventListener("mousemove", (e) => {
        const rect = avatarArea.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        avatar.style.transform = `
            rotateY(${x * 15}deg)
            rotateX(${-y * 10}deg)
            scale(1.05)
        `;
    });

    avatarArea.addEventListener("mouseleave", () => {
        avatar.style.transform =
            "rotateX(0deg) rotateY(0deg) scale(1)";
    });
}
document.addEventListener("DOMContentLoaded", function () {
    const panelButton = document.getElementById("panelButton");

    if (panelButton) {
        panelButton.onclick = function () {
            window.location.href = "admin.html";
        };
    }
});