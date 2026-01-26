const express = require("express");
const router = express.Router();
const { 
  createProperty, 
  updatePropertyImages,
  deletePropertyImage,
  deleteProperty,
  getAllProperties,
  getNearbyProperties,
  getPropertyById
} = require('../controllers/propertyController');

// Get all properties
router.get("/", getAllProperties);

// Get nearby properties (must be BEFORE /:id route)
router.get("/nearby", getNearbyProperties);

// Get single property by ID
router.get("/:id", getPropertyById);

// Create property with images
router.post("/",  createProperty);

// Update property images
router.put("/:id/images",  updatePropertyImages);

// Delete single image
router.delete("/:id/images", deletePropertyImage);

// Delete property (with S3 cleanup)
router.delete("/:id", deleteProperty);

module.exports = router;