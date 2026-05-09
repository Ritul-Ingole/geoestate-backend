const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Property = require('../models/Property');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// GET /api/properties
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: Get Nearby Properties
const getNearbyProperties = async (req, res) => {
  try {
    const { lng, lat, radius = 50000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ 
        success: false,
        error: "lng and lat are required" 
      });
    }

    const properties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          maxDistance: parseInt(radius),
          spherical: true,
        },
      },
    ]);

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Error fetching nearby properties:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Controller: Get Property by ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/properties  (protected — seller must be logged in)
const createProperty = async (req, res) => {
  try {
    const {
      title,
      price,
      purpose,
      propertyType,
      city,
      description,
      bedrooms,
      bathrooms,
      area,
      furnishedStatus,
      lat,
      lng,
    } = req.body;

    // Basic validation
    if (!title || !price || !purpose || !propertyType || !city || !lat || !lng) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    // Step 1: Create document first to get _id
    const property = await Property.create({
      title,
      price:           Number(price),
      purpose,
      propertyType,
      city,
      description,
      bedrooms:        bedrooms  ? Number(bedrooms)  : undefined,
      bathrooms:       bathrooms ? Number(bathrooms) : undefined,
      area:            area      ? Number(area)      : undefined,
      furnishedStatus: furnishedStatus || undefined,
      location: {
        type:        'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON: [lng, lat]
      },
      images: [],
      createdBy: req.user.id, // Associate property with the seller
    });

    // Step 2: Upload images to S3 using the new _id as folder name
    const imageUrls = [];
    const bucket    = process.env.AWS_S3_BUCKET_NAME;
    const cfUrl     = process.env.CLOUDFRONT_URL; // e.g. https://d1ujyj96xm2hzt.cloudfront.net

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const key  = `properties/${property._id}/image-${i + 1}.jpg`;

      await s3.send(new PutObjectCommand({
        Bucket:      bucket,
        Key:         key,
        Body:        file.buffer,
        ContentType: file.mimetype,
      }));

      imageUrls.push(`${cfUrl}/${key}`);
    }

    // Step 3: Update document with image URLs
    property.images = imageUrls;
    await property.save();

    res.status(201).json({ success: true, data: property });

  } catch (err) {
    console.error('createProperty error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/properties/my-listings  (protected)
const getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, error: "Not found" });
  if (property.createdBy.toString() !== req.user.id)
    return res.status(403).json({ success: false, error: "Unauthorized" });
  await property.deleteOne();
  res.json({ success: true });
};

// PATCH /api/properties/:id/status
const updatePropertyStatus = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, error: "Not found" });
  if (property.createdBy.toString() !== req.user.id)
    return res.status(403).json({ success: false, error: "Unauthorized" });
  property.status = req.body.status;
  await property.save();
  res.json({ success: true, property });
};

const updatePropertyImages = async (req, res) => {
  res.status(200).json({ success: true, message: "Images update disabled (local mode)" });
};

const deletePropertyImage = async (req, res) => {
  res.status(200).json({ success: true, message: "Delete image disabled (local mode)" });
};

module.exports = { getProperties, getPropertyById, createProperty, getNearbyProperties, getMyListings, updatePropertyImages, deletePropertyImage, deleteProperty, updatePropertyStatus };