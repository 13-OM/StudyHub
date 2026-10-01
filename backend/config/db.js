const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * The connection string comes from the .env file (MONGO_URI).
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyhub';
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
