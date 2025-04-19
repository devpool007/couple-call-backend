const express = require("express");
const { rateLimit } = require('express-rate-limit');
const { submitFeedback } = require("../db/submitFeedback");

const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
});
const router = express.Router();


router.get("/how-to-use", (req, res) => {
  res.json({
    title: "How to Use Couple Call",
    content: "Instructions for using the app...",
  });
});

router.get("/privacy-policy", (req, res) => {
  res.json({
    title: "Privacy Policy",
    content: "Our privacy policy details...",
  });
});

router.post('/feedback', feedbackLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Store feedback in database or send email
    const result = await submitFeedback(name, email, message);
    result.success && res.status(200).json({ message: 'Feedback saved!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
