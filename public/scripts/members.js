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
