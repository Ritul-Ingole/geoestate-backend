const express = require("express");
const Property = require("../models/Property");

const router = express.Router();

router.post("/", async (req, res) =>{
    try{
        const property = await Property.create(req.body);
        res.status(201).json(property);
    } catch(error){
        res.status(400).json({error: error.message});
    }
});


router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET /api/properties/nearby
router.get("/nearby", async (req, res) => {
  try {
    const { lng, lat, radius = 50000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: "lng and lat are required" });
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

    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;