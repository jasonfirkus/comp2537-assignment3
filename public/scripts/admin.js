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
  const { role } = event.target.dataset;

  button.firstChild.nodeValue = role;
  fetch(`/users/${button.parentElement.parentElement.dataset.userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  }).then((res) => console.log("Update response", res));
}
