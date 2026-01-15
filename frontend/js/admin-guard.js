// Admin Route Protection (Frontend Guard)

(function protectAdminRoute() {
  const token = localStorage.getItem("token");
  const affiliatelogin = localStorage.getItem("affiliatelogin");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in → go to login
  if (!token || !user) {
    window.location.href = "../login.html";
    return;
  }

  // Logged in but NOT admin → kick to home
  if (user.role !== "admin") {
    alert("Access denied: Admins only");
    window.location.href = "../index.html";
    return;
  }

  // ✅ Admin allowed
})();
