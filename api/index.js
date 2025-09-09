// api/index.js - This will be the entry point for Vercel
const app = require("../app");
const mongoose = require("mongoose");

// MongoDB connection with retry logic for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

// Export a serverless function handler
module.exports = async (req, res) => {
  try {
    // Connect to DB on first request
    if (!isConnected) {
      await connectDB();
    }

    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "production" ? "Server error" : error.message,
    });
  }
};
