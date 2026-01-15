const container = document.getElementById("packagesContainer");

packages.forEach(pkg => {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg shadow hover:shadow-lg overflow-hidden flex flex-col";

  card.innerHTML = `
    <div class="aspect-video overflow-hidden">
      <img src="${pkg.image}" alt="${pkg.title}"
           class="w-full h-full object-cover">
    </div>

    <div class="p-5 flex flex-col flex-grow">
      <h3 class="text-lg sm:text-xl font-bold">${pkg.title}</h3>

      <p class="text-sm mt-1 text-gray-600">
        ${pkg.location}
      </p>

      <p class="text-sm mt-1">
        ⏱ ${pkg.duration}
      </p>

      <p class="text-lg font-semibold text-orange-600 mt-3">
        ₹${pkg.price.toLocaleString()}
      </p>

      <a href="package.html?id=${pkg.id}"
         class="mt-auto text-center bg-orange-600 hover:bg-orange-700
                text-white py-3 rounded mt-4">
         View Details
      </a>
    </div>
  `;

  container.appendChild(card);
});
