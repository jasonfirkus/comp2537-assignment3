document.querySelectorAll(".animated-select-button").forEach((button) => {
  const { firstElementChild: arrow, nextElementSibling: list } = button;

  button.addEventListener("click", () => {
    arrow.classList.toggle("open");
    list.classList.toggle("open");
  });

  button.addEventListener("blur", () => {
    arrow.classList.remove("open");
    list.classList.remove("open");
  });

  for (const option of list.children) {
    option.addEventListener("mousedown", (event) => updateUserRole(event, button));
  }
});

function updateUserRole(event, button) {
  const { nodeValue: buttonText } = button.firstChild;
  const { currentTarget: option } = event;
  const { role } = option.dataset;
  const otherOption = option.nextElementSibling ?? option.previousElementSibling;

  if (buttonText == role) return;

  button.firstChild.nodeValue = role;
  option.querySelector(".is-selected").textContent = "✓";
  otherOption.querySelector(".is-selected").textContent = "";

  fetch(`/users/${button.parentElement.parentElement.dataset.userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  }).then((res) => console.log("Update response", res));
}
