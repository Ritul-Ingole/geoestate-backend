const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Property = require("./models/property");

dotenv.config();

const properties = [
  {
    title: "2BHK Apartment in Baner",
    price: 28000,
    purpose: "rent",
    propertyType: "apartment",
    location: {
      type: "Point",
      coordinates: [73.7898, 18.5590],
    },
  },
  {
    title: "3BHK Flat in Wakad",
    price: 32000,
    purpose: "rent",
    propertyType: "apartment",
    location: {
      type: "Point",
      coordinates: [73.7645, 18.5995],
    },
  },
  {
    title: "1BHK Studio in Hinjewadi",
    price: 18000,
    purpose: "rent",
    propertyType: "studio",
    location: {
      type: "Point",
      coordinates: [73.7163, 18.5913],
    },
  },
  {
    title: "Luxury Villa in Bavdhan",
    price: 12000000,
    purpose: "buy",
    propertyType: "villa",
    location: {
      type: "Point",
      coordinates: [73.7788, 18.5074],
    },
  },
  {
    title: "2BHK Flat in Andheri East",
    price: 42000,
    purpose: "rent",
    propertyType: "apartment",
    location: {
      type: "Point",
      coordinates: [72.8691, 19.1197],
    },
  },
  {
    title: "3BHK Apartment in Powai",
    price: 35000000,
    purpose: "buy",
    propertyType: "apartment",
    location: {
      type: "Point",
      coordinates: [72.9058, 19.1176],
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Property.deleteMany();
    console.log("Existing properties deleted");

    await Property.insertMany(properties);
    console.log("New properties inserted");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();