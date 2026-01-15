document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (!sidebar || !overlay || !toggleBtn) return;

  const openSidebar = () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  };

  const closeSidebar = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  toggleBtn.addEventListener("click", openSidebar);
  overlay.addEventListener("click", closeSidebar);
});
