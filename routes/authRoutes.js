const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, saveProperty, getSavedProperties, changePassword, deleteAccount } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.put("/update-profile", auth, updateProfile);
router.post("/save-property/:propertyId", auth, saveProperty);
router.get("/saved-properties", auth, getSavedProperties);
router.put('/change-password', auth, changePassword);
router.delete('/delete-account', auth, deleteAccount);

module.exports = router;