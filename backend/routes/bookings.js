const express = require("express");
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================
   USER BOOKINGS
========================= */
router.get("/my", auth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json(bookings);
});

/* =========================
   ADMIN: ALL BOOKINGS
========================= */
router.get("/all", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const bookings = await Booking.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
});

module.exports = router;
