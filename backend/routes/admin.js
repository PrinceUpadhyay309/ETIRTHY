const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/auth");
const logActivity = require("../utils/logActivity");

const router = express.Router();

/* =========================
   ADMIN CHECK (FIXED)
========================= */
function adminOnly(req, res, next) {
  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
}

/* =========================
   GET ALL USERS
========================= */
router.get("/users", auth, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/* =========================
   GET ALL BOOKINGS
========================= */
router.get("/bookings", auth, adminOnly, async (req, res) => {
  const bookings = await Booking.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
});

/* =========================
   UPDATE BOOKING STATUS
========================= */
router.put("/booking/:id", auth, adminOnly, async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  await logActivity({
    adminId: req.user.id,
    action: `Updated booking status to ${status}`,
    entityType: "booking",
    entityId: booking._id
  });

  res.json(booking);
});
/* =========================
   ADMIN DASHBOARD STATS
========================= */
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({ status: "paid" });

    res.json({
      totalUsers,
      totalBookings,
      pendingBookings,
      completedBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});
/* =========================
   ADMIN REVENUE STATS
========================= */
router.get("/revenue", auth, adminOnly, async (req, res) => {
  try {
    // Total completed revenue
    const completedAgg = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Pending amount
    const pendingAgg = await Booking.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Today revenue (completed today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayAgg = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfDay }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalRevenue: completedAgg[0]?.total || 0,
      pendingRevenue: pendingAgg[0]?.total || 0,
      todayRevenue: todayAgg[0]?.total || 0
    });

  } catch (err) {
    console.error("Revenue stats error:", err);
    res.status(500).json({ message: "Failed to load revenue stats" });
  }
});
/* =========================
   BOOKING TREND (LAST 7 DAYS)
========================= */
router.get("/booking-trend", auth, adminOnly, async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const trend = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trend);
  } catch (err) {
    console.error("Booking trend error:", err);
    res.status(500).json({ message: "Failed to load booking trend" });
  }
});

/* =========================
   GET AUDIT LOGS
========================= */
router.get("/audit-logs", auth, adminOnly, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load audit logs" });
  }
});

module.exports = router;
