const express = require('express');
const router  = express.Router();

const {
  getProperties,
  getPropertyById,
  getNearbyProperties,
  createProperty,
  getMyListings,
  updatePropertyImages,
  deletePropertyImage,
  deleteProperty,
  updatePropertyStatus,
} = require('../controllers/propertyController');

const auth   = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET all properties — public
router.get('/', getProperties);

// GET nearby properties — must be BEFORE /:id
router.get('/nearby', getNearbyProperties);

// GET logged-in user's listings — protected, must be BEFORE /:id
router.get('/my-listings', auth, getMyListings);

// GET single property by ID — public
router.get('/:id', getPropertyById);

// POST create property — protected + image upload
router.post('/', auth, upload.array('images', 15), createProperty);

// PUT update property images
router.put('/:id/images', updatePropertyImages);

// DELETE single image
router.delete('/:id/images', deletePropertyImage);

// DELETE property with S3 cleanup
router.delete('/:id', auth, deleteProperty);

// PATCH update property status
router.patch("/:id/status", auth, updatePropertyStatus);

module.exports = router;