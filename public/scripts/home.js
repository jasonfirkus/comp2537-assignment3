import isAuthenticated from "/scripts/isauth.js";

function convertToAnon() {
  document.querySelector("#container h1").innerHTML = "Please sign up or login";
  document.querySelectorAll(".member").forEach((link) => {
    link.classList.toggle("hidden");
  });
}

function convertToMember(name) {
  document.getElementById("name").textContent = name;
  document.querySelectorAll(".anon").forEach((link) => {
    link.classList.toggle("hidden");
  });
}

const isAuthResponse = await isAuthenticated();
if (!isAuthResponse) {
  convertToAnon();
} else {
  convertToMember(isAuthResponse.name);
}
