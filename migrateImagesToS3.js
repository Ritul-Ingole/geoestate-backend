// migrateImagesToS3.js
// Place this file in geostate-backend/
// Run: node migrateImagesToS3.js

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

// ── CONFIG ──────────────────────────────────────────────────────────
const IMAGES_DIR = "/Users/ritulingole/Grind/Projects/Geostate/images";
const MONGO_URI = "mongodb://localhost:27017/geostate";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL; // https://d1uiyi96xm2hzt.cloudfront.net
const BUCKET = process.env.AWS_S3_BUCKET_NAME;     // geostate-properties
// ────────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const PropertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model("Property", PropertySchema);

// Check if a key already exists in S3 — skip if it does
async function existsInS3(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(localPath, s3Key) {
  const fileBuffer = fs.readFileSync(localPath);
  const contentType = mime.lookup(localPath) || "image/jpeg";

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB\n");

  // Get all property folders from images dir
  const propertyFolders = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => fs.statSync(path.join(IMAGES_DIR, f)).isDirectory());

  console.log(`Found ${propertyFolders.length} property folders\n`);
  console.log("─".repeat(60));

  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let propertiesUpdated = 0;

  for (const propertyId of propertyFolders) {
    const folderPath = path.join(IMAGES_DIR, propertyId);

    // Verify this property exists in MongoDB
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log(`⚠  SKIPPED folder ${propertyId} — no matching property in DB`);
      continue;
    }

    console.log(`\n📁 ${property.title} (${propertyId})`);

    // Get all image files, skip .DS_Store and non-image files
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
      })
      .sort(); // consistent ordering

    if (files.length === 0) {
      console.log(`   ⚠  No images found in this folder`);
      continue;
    }

    const cloudFrontUrls = [];
    let index = 1;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const cleanName = `image-${index}${ext}`; // image-1.jpg, image-2.jpg ...
      const s3Key = `properties/${propertyId}/${cleanName}`;
      const localFilePath = path.join(folderPath, file);

      // Skip if already uploaded
      const alreadyUploaded = await existsInS3(s3Key);
      if (alreadyUploaded) {
        console.log(`   ↷  Skipped (already in S3): ${cleanName}`);
        cloudFrontUrls.push(`${CLOUDFRONT_URL}/${s3Key}`);
        totalSkipped++;
        index++;
        continue;
      }

      try {
        await uploadFile(localFilePath, s3Key);
        const url = `${CLOUDFRONT_URL}/${s3Key}`;
        cloudFrontUrls.push(url);
        console.log(`   ✓  Uploaded: ${file} → ${cleanName}`);
        totalUploaded++;
        index++;
      } catch (err) {
        console.log(`   ✗  Failed: ${file} — ${err.message}`);
        totalFailed++;
        index++;
      }
    }

    // Update MongoDB images array with CloudFront URLs
    if (cloudFrontUrls.length > 0) {
      await Property.findByIdAndUpdate(propertyId, {
        $set: { images: cloudFrontUrls },
      });
      console.log(`   ✓  MongoDB updated with ${cloudFrontUrls.length} CloudFront URLs`);
      propertiesUpdated++;
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log(`\n✅ DONE`);
  console.log(`   Uploaded:           ${totalUploaded} images`);
  console.log(`   Skipped (existing): ${totalSkipped} images`);
  console.log(`   Failed:             ${totalFailed} images`);
  console.log(`   Properties updated: ${propertiesUpdated}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});