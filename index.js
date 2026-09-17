require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use("/uploads", express.static("uploads"));

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL
];

app.use(cors({
  origin: ["https://geostate.homes", "https://www.geostate.homes", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("/{*path}", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "GeoState API is running",
    endpoints: {
      properties: "/api/properties",
      nearbyProperties: "/api/properties/nearby?lng=73.7898&lat=18.5590&radius=5000"
    }
  });
});

//Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Routes
const propertyRoutes = require("./routes/propertyRoutes");
app.use("/api/properties", propertyRoutes); 

// Assistant Routes
const assistantRoutes = require("./routes/assistantRoutes");
app.use("/api/assistant", assistantRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/geostate")
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT);

