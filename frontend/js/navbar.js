document.addEventListener("DOMContentLoaded", async () => {
  /* =========================
     LOAD NAVBAR HTML
  ========================= */
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

  const res = await fetch("components/navbar.html");
  navbarContainer.innerHTML = await res.text();

  /* =========================
     MOBILE MENU TOGGLE
  ========================= */
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  /* =========================
     AUTH LOGIC
  ========================= */
  const token = localStorage.getItem("token");
  const authLink = document.getElementById("authLink");
  const mobileAuthLink = document.getElementById("mobileAuthLink");

  if (token) {
    authLink.innerHTML = `
      <button onclick="logout()"
        class="px-4 py-2 rounded-full
               border border-orange-500
               text-orange-600 text-sm font-medium
               hover:bg-orange-50 transition">
        Logout
      </button>
    `;

    mobileAuthLink.innerHTML = `
      <button onclick="logout()"
        class="w-full py-2 rounded-full
               border border-orange-500
               text-orange-600 text-sm
               hover:bg-orange-50 transition">
        Logout
      </button>
    `;
  } else {
    authLink.innerHTML = `
      <a href="login.html"
         class="px-4 py-2 rounded-full
                bg-orange-600 text-white
                text-sm font-medium
                hover:bg-orange-700 transition">
        Login
      </a>
    `;

    mobileAuthLink.innerHTML = `
      <a href="login.html"
         class="block text-center py-2 rounded-full
                bg-orange-600 text-white text-sm
                hover:bg-orange-700 transition">
        Login
      </a>
    `;
  }

  /* =========================
     PROFILE STRIP LOGIC
  ========================= */
  const profileStrip = document.getElementById("profileStrip");
  const profileLeft = document.getElementById("profileLeft");
  const profileRight = document.getElementById("profileRight");

  if (profileStrip && profileLeft && profileRight) {
    if (token) {
      const user = JSON.parse(localStorage.getItem("user"));

      profileStrip.classList.remove("hidden");
      profileLeft.textContent = `Hi, ${user?.name || "User"}`;

      profileRight.innerHTML = `
        <button id="profileBtn" class="hover:underline">
          My Account ▾
        </button>

        <div id="profileMenu"
             class="absolute right-0 mt-2 w-44
                    bg-white text-gray-800 rounded shadow hidden">

          ${
            user?.role === "admin"
              ? `<a href="admin/dashboard.html"
                   class="block px-4 py-2 hover:bg-gray-100">
                   🛠 Admin Dashboard
                 </a>`
              : ""
          }

          <a href="${user?.role === "admin" ? "admin/profile.html" : "profile.html"}"
             class="block px-4 py-2 hover:bg-gray-100">
            👤 Profile
          </a>

          <button onclick="logout()"
                  class="block w-full text-left px-4 py-2
                         text-red-600 hover:bg-red-50">
            Logout
          </button>
        </div>
      `;

      const profileBtn = document.getElementById("profileBtn");
      const profileMenu = document.getElementById("profileMenu");

      profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle("hidden");
      });

      document.addEventListener("click", () => {
        profileMenu.classList.add("hidden");
      });
    } else {
      profileStrip.classList.add("hidden");
    }
  }
}); // ✅ THIS WAS MISSING

/* =========================
   LOGOUT FUNCTION
========================= */
function logout() {
  logoutUser("home");
}
