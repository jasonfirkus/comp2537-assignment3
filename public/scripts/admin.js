const ROLES = ["user", "admin"];

document.querySelectorAll(".animated-select-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.firstElementChild.classList.toggle("open");
    button.nextElementSibling.classList.toggle("shown");
  });
  button.addEventListener("blur", () => {
    button.firstElementChild.classList.toggle("open");
    button.nextElementSibling.classList.toggle("shown");
  });
});

function showOptions(button) {}
