document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") return;

  const nameEl = document.getElementById("adminName");
  const roleEl = document.getElementById("adminRole");

  if (nameEl) nameEl.textContent = user.name || "Admin";
  if (roleEl) roleEl.textContent = "ADMIN";
});
