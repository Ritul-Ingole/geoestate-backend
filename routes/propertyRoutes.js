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


router.get("/nearby", async (req,res) =>{
    try{
        const {lng, lat, distance =5000} = req.query;
        
        if(!lng || !lat){
            return res.status(400).json({
                error: "lng and lat required"
            });
        }
        const properties = await Property.find({
            location:{
                $near:{
                    $geometry:{
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance)
                }
            }
        });
        res.json(properties);
    } catch(error){
        return res.status(500).json({error: error.message});
    }
});

module.exports = router;