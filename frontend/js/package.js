const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

const pkg = packages.find(p => p.id === id);

if (!pkg) {
  document.body.innerHTML = "<h2 class='text-center mt-20'>Package not found</h2>";
}

document.getElementById("pkgTitle").textContent = pkg.title;
document.getElementById("pkgImage").src = pkg.image;
document.getElementById("pkgImage").alt = pkg.title;
document.getElementById("pkgLocation").textContent = pkg.location;
document.getElementById("pkgPrice").textContent =
  `₹${pkg.price.toLocaleString()}`;
document.getElementById("pkgDuration").textContent =
  `⏱ ${pkg.duration}`;

const itineraryList = document.getElementById("pkgItinerary");
pkg.itinerary.forEach(day => {
  const li = document.createElement("li");
  li.textContent = day;
  itineraryList.appendChild(li);
});

// ✅ Book Now redirect
document.addEventListener("DOMContentLoaded", () => {
  const bookBtn = document.getElementById("bookNowBtn");

  if (!bookBtn) {
    console.error("Book Now button not found");
    return;
  }

  bookBtn.addEventListener("click", () => {
    window.location.href = `booking.html?id=${pkg.id}`;
  });
});

