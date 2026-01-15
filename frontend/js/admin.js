/* =========================
   ADMIN GUARD (SELF CONTAINED)
========================= */
(function adminGuard() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    alert("Please login first");
    window.location.href = "../login.html";
    return;
  }

  if (!["admin", "superadmin"].includes(user.role)) {
    alert("Unauthorized access");
    window.location.href = "../index.html";
    return;
  }
})();

const token = localStorage.getItem("token");
const API = "http://localhost:5000/api/admin";

/* =========================
   LOAD USERS (USERS PAGE)
========================= */
async function loadUsers() {
  const table = document.getElementById("usersTable");
  if (!table) return;

  const res = await fetch(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    table.innerHTML = "<p>Access denied</p>";
    return;
  }

  const users = await res.json();

  table.innerHTML = `
    <table class="w-full text-sm">
      <tr class="font-bold border-b">
        <td>Name</td><td>Email</td><td>Role</td>
      </tr>
      ${users.map(u => `
        <tr class="border-b">
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* =========================
   LOAD BOOKINGS (BOOKINGS PAGE)
========================= */
async function loadBookings() {
  const table = document.getElementById("bookingsTable");
  if (!table) return;

  const res = await fetch(`${API}/bookings`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    table.innerHTML = "<p>Access denied</p>";
    return;
  }

  const bookings = await res.json();

  table.innerHTML = `
    <table class="w-full text-sm">
      <tr class="font-bold border-b">
        <td>User</td><td>Amount</td><td>Status</td><td>Action</td>
      </tr>
      ${bookings.map(b => `
        <tr class="border-b">
          <td>${b.userId?.name || "-"}</td>
          <td>₹${(b.amount || 0) / 100}</td>
          <td>${b.status}</td>
          <td>
            <select onchange="updateStatus('${b._id}', this.value)">
              <option value="pending" ${b.status==="pending"?"selected":""}>pending</option>
              <option value="completed" ${b.status==="completed"?"selected":""}>completed</option>
              <option value="cancelled" ${b.status==="cancelled"?"selected":""}>cancelled</option>
            </select>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* =========================
   UPDATE BOOKING STATUS
========================= */
async function updateStatus(id, status) {
  await fetch(`${API}/booking/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  loadBookings();
}

/* =========================
   LOAD DASHBOARD STATS
========================= */
async function loadStats() {
  const el = document.getElementById("totalUsers");
  if (!el) return;

  try {
    const res = await fetch(`${API}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Stats fetch failed");

    const stats = await res.json();

    document.getElementById("totalUsers").innerText = stats.totalUsers;
    document.getElementById("totalBookings").innerText = stats.totalBookings;
    document.getElementById("pendingBookings").innerText = stats.pendingBookings;
    document.getElementById("completedBookings").innerText = stats.completedBookings;

  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
}

/* =========================
   LOAD REVENUE STATS
========================= */
async function loadRevenue() {
  const el = document.getElementById("totalRevenue");
  if (!el) return;

  try {
    const res = await fetch(`${API}/revenue`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Revenue fetch failed");

    const data = await res.json();

    document.getElementById("totalRevenue").innerText =
      `₹${(data.totalRevenue / 100).toLocaleString("en-IN")}`;

    document.getElementById("todayRevenue").innerText =
      `₹${(data.todayRevenue / 100).toLocaleString("en-IN")}`;

    document.getElementById("pendingRevenue").innerText =
      `₹${(data.pendingRevenue / 100).toLocaleString("en-IN")}`;

  } catch (err) {
    console.error("Revenue stats error:", err);
  }
}

/* =========================
   LOAD BOOKING TREND CHART
========================= */
async function loadBookingTrend() {
  const canvas = document.getElementById("bookingChart");
  if (!canvas) return;

  try {
    const res = await fetch(`${API}/booking-trend`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Trend fetch failed");

    const data = await res.json();

    // Prepare last 7 days labels
    const labels = [];
    const counts = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      labels.push(key);
      const found = data.find(item => item._id === key);
      counts.push(found ? found.count : 0);
    }

    new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Bookings",
          data: counts,
          borderWidth: 2,
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });

  } catch (err) {
    console.error("Booking chart error:", err);
  }
}
/* =========================
   LOAD AUDIT LOGS
========================= */
// async function loadAuditLogs() {
//   const list = document.getElementById("auditLogList");
//   if (!list) return;

//   try {
//     const res = await fetch(`${API}/audit-logs`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     if (!res.ok) throw new Error("Audit logs fetch failed");

//     const logs = await res.json();

//     list.innerHTML = logs.map(log => `
//       <li class="border-b pb-1">
//         <strong>${log.adminId?.name || "Admin"}</strong>
//         ${log.action}
//         <span class="text-gray-400 text-xs">
//           (${new Date(log.createdAt).toLocaleString()})
//         </span>
//       </li>
//     `).join("");

//   } catch (err) {
//     console.error("Audit logs error:", err);
//   }
// }
async function loadAuditLogs() {
  const list = document.getElementById("auditLogList");
  if (!list) return;

  try {
    const res = await fetch(`${API}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Audit logs fetch failed");

    let logs = await res.json();

    // Show only latest 5 logs on dashboard
    logs = logs.slice(0, 5);

    list.innerHTML = logs.map(log => {
      const iconMap = {
        auth: "🔐",
        booking: "📦",
        payment: "💰",
        user: "👤"
      };

      const icon = iconMap[log.entityType] || "⚙️";

      return `
        <li class="activity-item">
          <span class="activity-icon">${icon}</span>
          <div class="activity-content">
            <div>
              <strong>${log.adminId?.name || "Admin"}</strong>
              ${log.action}
            </div>
            <small class="activity-time">
              ${new Date(log.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </small>
          </div>
        </li>
      `;
    }).join("");

  } catch (err) {
    console.error("Audit logs error:", err);
  }
}

/* =========================
   INIT (PAGE-AWARE)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadRevenue();
  loadBookingTrend();
  loadAuditLogs();

  loadUsers();
  loadBookings();
});
