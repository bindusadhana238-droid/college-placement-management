const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER - /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists, try login" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashed,
      role: role || "student"
    });

    res.json({ msg: "Account created successfully!" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// LOGIN - /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found, register first" });

    if (role && user.role!== role.toLowerCase()) {
      return res.status(400).json({ msg: `You are registered as ${user.role}, not ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "placement_secret",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

module.exports = router;