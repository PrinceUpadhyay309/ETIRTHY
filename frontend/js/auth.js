const API = "http://localhost:5000/api/auth";

/* ==============================
   REGISTER
============================== */
async function register() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("✅ Registration successful! Please login.");
    window.location.href = "login.html";

  } catch (err) {
    console.error("Register error:", err);
    alert("Server error");
  }
}

/* ==============================
   LOGIN
============================== */
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const loginType = document.querySelector(
    'input[name="loginType"]:checked'
  ).value;

  if (!email || !password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, loginType })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    /* =========================
       ROLE-BASED REDIRECT (FIX)
    ========================= */
    if (["admin", "superadmin"].includes(data.user.role)) {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (err) {
    alert("Server error");
  }
}

/* ==============================
   AUTH GUARD
============================== */
function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
}

/* ==============================
   LOGOUT
============================== */
function logout() {
 logoutUser("login");
}


/* ==============================
   RENDER AUTH UI
============================== */
function renderAuthUI() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const authLink = document.getElementById("authLink");
  const mobileAuthLink = document.getElementById("mobileAuthLink");
  const profileLeft = document.getElementById("profileLeft");
  const profileRight = document.getElementById("profileRight");

  if (!user || !token) {
    if (authLink) authLink.innerHTML = `<a href="login.html">Login</a>`;
    if (mobileAuthLink) mobileAuthLink.innerHTML = `<a href="login.html">Login</a>`;
    if (profileLeft) profileLeft.innerHTML = "";
    if (profileRight) profileRight.innerHTML = `<a href="login.html">Login</a>`;
    return;
  }

  if (authLink) {
    authLink.innerHTML = `<button onclick="logout()">Logout</button>`;
  }

  if (mobileAuthLink) {
    mobileAuthLink.innerHTML = `<button onclick="logout()">Logout</button>`;
  }

  if (profileLeft) profileLeft.innerHTML = `Hi, ${user.name}`;

  if (profileRight) {
    profileRight.innerHTML = `
      <div class="relative">
        <button id="profileBtn">My Account ▾</button>
        <div id="profileMenu" class="hidden absolute right-0 bg-white shadow">
          <a href="profile.html" class="block px-4 py-2">Profile</a>
          <button onclick="logout()" class="block w-full text-left px-4 py-2 text-red-600">
            Logout
          </button>
        </div>
      </div>
    `;
  }

  const btn = document.getElementById("profileBtn");
  const menu = document.getElementById("profileMenu");

  if (btn && menu) {
    btn.onclick = () => menu.classList.toggle("hidden");
    document.addEventListener("click", e => {
      if (!e.target.closest("#profileBtn")) {
        menu.classList.add("hidden");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", renderAuthUI);
