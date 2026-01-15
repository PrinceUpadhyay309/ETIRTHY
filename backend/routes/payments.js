const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================
   RAZORPAY INSTANCE
========================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* =========================
   1️⃣ CREATE ORDER
   PUBLIC (NO AUTH)
========================= */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR"
    });

    res.json(order);

  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

/* =========================
   2️⃣ VERIFY PAYMENT
   PROTECTED (JWT)
========================= */
router.post("/verify", auth, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingData
    } = req.body;

    // 🔐 Verify Razorpay signature
    const sign =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // ✅ Save booking in MongoDB
    const booking = await Booking.create({
      userId: req.user.id,                 // 🔐 logged-in user
      packageId: bookingData.packageId,
      date: bookingData.date,
      passengers: bookingData.passengers,
      amount: bookingData.amount,

      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentMethod: "Razorpay",
      status: "paid"
    });

    res.json({
      success: true,
      bookingId: booking._id
    });

  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
});

module.exports = router;
