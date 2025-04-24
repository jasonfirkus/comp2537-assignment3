import isAuthenticated from "/scripts/isauth.js";

const isAuthResponse = await isAuthenticated();
const images = ["lexus-is.jpg", "lexus-lc.jpg", "lexus-lfa.jpg"];
const rndIndex = Math.floor(Math.random() * images.length);

if (!isAuthResponse) {
  window.location.href = "/";
} else {
  document.getElementById("name").textContent = isAuthResponse.name;
  document.getElementById("members-img").src = `/assets/${images[rndIndex]}`;
}

async function logout() {
  try {
    const response = await fetch("/logout");
    console.log("Successfully logged out user");
    window.location.href = "/";
  } catch (error) {
    console.log("Error logging out user", error);
  }
}

document.getElementById("logout").addEventListener("click", () => {
  logout();
});
