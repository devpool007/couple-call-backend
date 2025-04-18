const express = require("express");
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

router.post('/feedback', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Store feedback in database or send email
    // Add your implementation here
    
    res.json({ message: 'Feedback received successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
