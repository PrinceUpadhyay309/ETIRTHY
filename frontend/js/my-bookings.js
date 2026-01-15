// Protect page
requireAuth();

const API = "http://localhost:5000/api/bookings/my";
const container = document.getElementById("bookingsContainer");

async function loadMyBookings() {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const bookings = await res.json();

    if (!res.ok) {
      container.innerHTML =
        "<p class='text-red-600'>Failed to load bookings</p>";
      return;
    }

    if (bookings.length === 0) {
      container.innerHTML =
        "<p>You have no bookings yet.</p>";
      return;
    }

    container.innerHTML = "";

    bookings.forEach(b => {
      container.innerHTML += `
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="font-bold text-lg mb-2">
            Package ID: ${b.packageId}
          </h3>

          <p>📅 Date: ${b.date}</p>
          <p>👥 Passengers: ${b.passengers}</p>
          <p class="font-semibold text-orange-600">
            ₹${(b.amount / 100).toLocaleString()}
          </p>

          <p class="mt-2 text-sm">
            Status:
            <span class="${
              b.status === "paid"
                ? "text-green-600"
                : "text-yellow-600"
            }">
              ${b.status}
            </span>
          </p>

          <p class="text-xs text-gray-500 mt-2">
            Booking ID: ${b._id}
          </p>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p class='text-red-600'>Server error</p>";
  }
}

loadMyBookings();
