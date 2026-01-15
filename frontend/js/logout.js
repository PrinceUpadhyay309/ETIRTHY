/**
 * Shared Logout Utility
 * @param {"home" | "login"} redirect
 */
function logoutUser(redirect = "login") {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (redirect === "home") {
    window.location.href = "/frontend/index.html";
  } else {
    window.location.href = "/frontend/login.html";
  }
}
