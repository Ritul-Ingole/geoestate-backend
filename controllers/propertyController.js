const Property = require('../models/Property');

// Controller: Get All Properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
    
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
      return res.status(404).json({ 
        success: false,
        error: "Property not found" 
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const createProperty = async (req, res) => {
  const property = await Property.create(req.body);
  res.status(201).json({ success: true, data: property });
};

const updatePropertyImages = async (req, res) => {
  res.status(200).json({ success: true, message: "Images update disabled (local mode)" });
};

const deletePropertyImage = async (req, res) => {
  res.status(200).json({ success: true, message: "Delete image disabled (local mode)" });
};

const deleteProperty = async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true });
};

module.exports = {
  createProperty,
  updatePropertyImages,
  deletePropertyImage,
  deleteProperty,
  getAllProperties,
  getNearbyProperties,
  getPropertyById
};