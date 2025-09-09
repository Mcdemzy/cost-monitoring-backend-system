const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const staffRoutes = require("./routes/staff");
const cashAdvanceRoutes = require("./routes/cashAdvance");

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, serverless functions)
    if (!origin) return callback(null, true);

    // Allow your frontend domains
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://cash-advance-monitoring.vercel.app",
      "https://*.vercel.app",
      "https://*.vercel.app",
    ];

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin.includes("*")) {
        const regex = new RegExp("^" + allowedOrigin.replace("*", ".*") + "$");
        return regex.test(origin);
      }
      return origin === allowedOrigin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.get("/api/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.status(200).json({
      message: "Server is running!",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/cash-advance", cashAdvanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
