const User = require("../models/User");
const Property = require("../models/Property");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User registered",
  });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, user });
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone },
    { new: true, runValidators: true }
  ).select("-password");
  res.json({ success: true, user });
};


// POST /api/auth/save-property/:propertyId
exports.saveProperty = async (req, res) => {
  const user = await User.findById(req.user.id);
  const id = req.params.propertyId;
  const already = user.savedProperties.includes(id);
  if (already) {
    user.savedProperties = user.savedProperties.filter(p => p.toString() !== id);
  } else {
    user.savedProperties.push(id);
  }
  await user.save();
  res.json({ success: true, saved: !already });
};

// GET /api/auth/saved-properties
exports.getSavedProperties = async (req, res) => {
  const user = await User.findById(req.user.id).populate("savedProperties");
  res.json({ success: true, properties: user.savedProperties });
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
  user.password = newPassword;
  await user.save(); // pre-save hook hashes it
  res.json({ success: true });
};

// DELETE /api/auth/delete-account
exports.deleteAccount = async (req, res) => {
  await Property.deleteMany({ createdBy: req.user.id });
  await User.findByIdAndDelete(req.user.id);
  res.json({ success: true });
};