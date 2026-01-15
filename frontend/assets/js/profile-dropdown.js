document.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const greetingText = document.getElementById("greetingText");
  const loginLink = document.getElementById("loginLink");
  const profileDropdown = document.getElementById("profileDropdown");
  const profileMenu = document.getElementById("profileMenu");

  // ===== NOT LOGGED IN =====
  if (!user) {
    loginLink.classList.remove("hidden");
    greetingText.classList.add("hidden");
    profileDropdown.classList.add("hidden");
    return;
  }

  // ===== LOGGED IN =====
  loginLink.classList.add("hidden");
  greetingText.classList.remove("hidden");
  profileDropdown.classList.remove("hidden");

  greetingText.textContent = `Hi, ${user.name}`;

  profileMenu.innerHTML = `
    <a href="profile.html" class="block px-4 py-3 hover:bg-gray-100">
      👤 My Profile
    </a>
    <a href="booking.html" class="block px-4 py-3 hover:bg-gray-100">
      📜 My Bookings
    </a>
    <div class="border-t"></div>
    <button id="logoutBtn"
            class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50">
      🚪 Logout
    </button>
  `;

  profileDropdown.onclick = (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("hidden");
  };

  document.getElementById("logoutBtn").onclick = () => {
    logoutUser("login");
  };

});
