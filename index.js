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
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
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

// MongoDB Connection
console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✓ MongoDB connected"))
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
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

app.post("/test", (req,res) => {
    console.log(req.body);
    res.json({
        recieved: req.body
    });
});

