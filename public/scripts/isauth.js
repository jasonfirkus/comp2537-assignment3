export default async function isAuthenticated() {
  try {
    const response = await fetch("/authenticated");

    if (response.ok) {
      return await response.json();
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error fetching authentication status", error);
    return { name: "error" };
  }
}
