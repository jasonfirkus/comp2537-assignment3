document.getElementById("open-offcanvas-nav").addEventListener("click", () => {
  document.getElementById("offcanvas-nav").hidden = false;
  document.body.style.overflow = "hidden";
});

document.getElementById("close-offcanvas-nav").addEventListener("click", () => {
  document.getElementById("offcanvas-nav").hidden = true;
  document.body.style.overflow = "scroll";
});
