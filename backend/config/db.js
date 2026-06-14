const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * Retries are handled automatically by Mongoose 8.x.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit the process if DB connection fails
  }
};

module.exports = connectDB;
