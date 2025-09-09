const app = require("./app");
const mongoose = require("mongoose");

// Connect to database with improved configuration
const connectDB = async () => {
  try {
    // Remove deprecated options and add proper timeout settings
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 5, // Reduced pool size for serverless environment
      minPoolSize: 1,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.error("Please check your MONGODB_URI in environment variables");
    process.exit(1);
  }
};

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing server gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
