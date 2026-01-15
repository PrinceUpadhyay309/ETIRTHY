document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     GET PACKAGE FROM URL
  =============================== */
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  const pkg = packages.find(p => p.id === id);
  if (!pkg) {
    document.body.innerHTML =
      "<h2 class='text-center mt-20'>Package not found</h2>";
    return;
  }

  document.getElementById("pkgTitle").textContent = pkg.title;

  /* ===============================
     ELEMENT REFERENCES
  =============================== */
  const passengersSelect = document.getElementById("passengers");
  const totalAmountEl = document.getElementById("totalAmount");
  const confirmBtn = document.getElementById("confirmBtn");
  const travelDateEl = document.getElementById("travelDate");

  /* ===============================
     PRICE CALCULATION
  =============================== */
  function updateTotal() {
    const passengers = parseInt(passengersSelect.value);
    const total = passengers * Number(pkg.price);
    totalAmountEl.textContent = `₹${total.toLocaleString()}`;
  }

  passengersSelect.addEventListener("change", updateTotal);
  updateTotal();

  /* ===============================
     PROCEED TO CONFIRM
  =============================== */
  confirmBtn.addEventListener("click", async () => {

    const date = travelDateEl.value;
    const passengers = parseInt(passengersSelect.value);

    if (!date) {
      alert("Please select a travel date");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const amount = passengers * Number(pkg.price) * 100; // paise

    if (!amount || isNaN(amount)) {
      alert("Invalid amount. Please reload the page.");
      return;
    }

    try {
      /* ===============================
         1️⃣ CREATE ORDER (BACKEND)
      =============================== */
      const orderRes = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount })
        }
      );

      if (!orderRes.ok) {
        const text = await orderRes.text();
        console.error("Create-order failed:", text);
        alert("Payment initialization failed");
        return;
      }

      const order = await orderRes.json();

      /* ===============================
         2️⃣ RAZORPAY CHECKOUT
      =============================== */
      const options = {
        key: "rzp_test_S1TFYrgInmHk1x", // 🔴 PUT REAL TEST KEY ID
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Bharadwaj Tirth Yatra",
        description: pkg.title,

        method: {
          card: true,
          upi: true,
          netbanking: true,
          wallet: true
        },

        handler: async function (response) {
          try {
            /* ===============================
               3️⃣ VERIFY PAYMENT (BACKEND)
            =============================== */
            const verifyRes = await fetch(
              "http://localhost:5000/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingData: {
                    packageId: pkg.id,
                    date,
                    passengers,
                    amount: order.amount
                  }
                })
              }
            );

            if (!verifyRes.ok) {
              alert("Payment verification failed");
              return;
            }

            const result = await verifyRes.json();

            if (result.success) {
              alert("✅ Booking Confirmed!");
              window.location.href = "index.html";
            } else {
              alert("❌ Payment verification failed");
            }

          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification error");
          }
        },

        modal: {
          ondismiss: function () {
            alert("❌ Payment cancelled by user");
          }
        },

        theme: {
          color: "#ea580c"
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment flow error:", err);
      alert("Something went wrong");
    }
  });
});
