const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    error: "Too many assistant requests. Please try again later.",
  },
});

const assistantController = require("../controllers/assistantController");

router.post("/chat", assistantLimiter, assistantController.chat);

module.exports = router;