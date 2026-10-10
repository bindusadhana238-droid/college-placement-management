const express = require("express");
const Job = require("../models/Job");
const router = express.Router();

// Get all jobs - for Students
router.get("/", async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// Post new job - for Admin
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json({ msg: "Job posted!", job });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete job
router.delete("/:id", async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ msg: "Job deleted" });
});

module.exports = router;