const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, saveProperty, getSavedProperties } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.put("/update-profile", auth, updateProfile);
router.post("/save-property/:propertyId", auth, saveProperty);
router.get("/saved-properties", auth, getSavedProperties);

module.exports = router;