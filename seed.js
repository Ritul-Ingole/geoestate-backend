const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Property = require("./models/Property");

mongoose.connect(process.env.MONGO_URI);

const IMAGES_ROOT = path.join(__dirname, "../images");
console.log("IMAGES_ROOT =", IMAGES_ROOT);

const propertiesMeta = [
  {
    title: "1BHK Studio in Hinjewadi",
    price: 18000,
    purpose: "rent",
    propertyType: "studio",
    location: { type: "Point", coordinates: [73.7163, 18.5913] },
  },
  {
    title: "Luxury Villa in Bavdhan",
    price: 12000000,
    purpose: "buy",
    propertyType: "villa",
    location: { type: "Point", coordinates: [73.7788, 18.5074] },
  },
  {
    title: "2BHK Flat in Andheri East",
    price: 42000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8691, 19.1197] },
  },
  {
    title: "3BHK Apartment in Powai",
    price: 35000000,
    purpose: "buy",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.9058, 19.1176] },
  },
  {
    title: "2BHK Flat in Kothrud",
    price: 30000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.8077, 18.5074] },
  },
  {
    title: "3BHK Apartment in Aundh",
    price: 38000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.8070, 18.5603] },
  },
  {
    title: "1BHK Studio in Karve Nagar",
    price: 18000,
    purpose: "rent",
    propertyType: "studio",
    location: { type: "Point", coordinates: [73.8213, 18.5018] },
  },
  {
    title: "Luxury Villa in Pashan",
    price: 15000000,
    purpose: "sell",
    propertyType: "villa",
    location: { type: "Point", coordinates: [73.7935, 18.5416] },
  },
  {
    title: "2BHK Flat in Hadapsar",
    price: 28000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.9270, 18.5089] },
  },
  {
    title: "3BHK Penthouse in Magarpatta",
    price: 22000000,
    purpose: "sell",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.9307, 18.5164] },
  },
  {
    title: "2BHK Flat in Borivali West",
    price: 38000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8489, 19.2311] },
  },
  {
    title: "1BHK in Kandivali East",
    price: 29000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8640, 19.2058] },
  },
  {
    title: "3BHK Sea View Apartment in Bandra",
    price: 75000000,
    purpose: "sell",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8295, 19.0607] },
  },
  {
    title: "Luxury Villa in Juhu",
    price: 120000000,
    purpose: "sell",
    propertyType: "villa",
    location: { type: "Point", coordinates: [72.8264, 19.1075] },
  },
  {
    title: "Studio Apartment in Andheri West",
    price: 26000,
    purpose: "rent",
    propertyType: "studio",
    location: { type: "Point", coordinates: [72.8347, 19.1364] },
  },
  {
    title: "2BHK Flat in Goregaon East",
    price: 34000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8712, 19.1551] },
  },
  {
    title: "Affordable 1BHK in Wagholi",
    price: 15000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.9797, 18.5793] },
  },
  {
    title: "3BHK Flat in Viman Nagar",
    price: 40000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.9143, 18.5679] },
  },
  {
    title: "Premium Villa in Koregaon Park",
    price: 50000000,
    purpose: "sell",
    propertyType: "villa",
    location: { type: "Point", coordinates: [73.8940, 18.5362] },
  },
  {
    title: "Studio in Lower Parel",
    price: 32000,
    purpose: "rent",
    propertyType: "studio",
    location: { type: "Point", coordinates: [72.8316, 18.9977] },
  },
  {
    title: "2BHK Flat in Chembur",
    price: 36000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8940, 19.0625] },
  },
  {
    title: "4BHK Luxury Apartment in Worli",
    price: 98000000,
    purpose: "sell",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [72.8173, 18.9970] },
  },
  {
    title: "Compact 1BHK in Dhanori",
    price: 17000,
    purpose: "rent",
    propertyType: "apartment",
    location: { type: "Point", coordinates: [73.8788, 18.5869] },
  },
  {
    title: "Smart Studio in Hinjewadi Phase 2",
    price: 20000,
    purpose: "rent",
    propertyType: "studio",
    location: { type: "Point", coordinates: [73.7190, 18.5945] },
  },
];

async function seed() {
  await Property.deleteMany();
  console.log("Old properties cleared");

  const folders = fs.readdirSync(IMAGES_ROOT).filter(f =>
  fs.statSync(path.join(IMAGES_ROOT, f)).isDirectory()
);

for (let i = 0; i < folders.length; i++) {
  const folder = folders[i];
  const meta = propertiesMeta[i];

  if (!meta) continue;

  const folderPath = path.join(IMAGES_ROOT, folder);
  const imageFiles = fs.readdirSync(folderPath);

  const images = imageFiles.map(file =>
    `/uploads/properties/${folder}/${file}`
  );

  await Property.create({
    ...meta,
    images,
  });

  console.log(`Seeded: ${meta.title}`);
}

  console.log("Seeding complete");
  process.exit();
}

seed();