const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logActivity = require("../utils/logActivity"); // ✅ audit log

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",          // ✅ force default role
      status: "active"       // ✅ future-proof
    });

    res.json({ message: "Registration successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({ message: "Account suspended" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* =========================
       ADMIN LOGIN PROTECTION (FIXED)
    ========================= */
    if (
      loginType === "admin" &&
      !["admin", "superadmin"].includes(user.role)
    ) {
      return res.status(403).json({
        message: "You are not authorized as admin",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* =========================
       AUDIT LOG (ADMIN LOGIN)
    ========================= */
    if (["admin", "superadmin"].includes(user.role)) {
      await logActivity({
        adminId: user._id,
        action: "Logged in",
        entityType: "auth"
      });
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
