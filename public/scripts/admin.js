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
});
