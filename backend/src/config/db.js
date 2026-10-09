const dns = require('dns');
const mongoose = require('mongoose');

// Configure Node.js DNS servers to resolve MongoDB Atlas SRV records reliably
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoURI) {
      console.warn('[MongoDB] MONGO_URI is not defined in backend/.env.');
      return;
    }

    mongoose.set('strictQuery', false);

    // Register event listeners to prevent unhandled EventEmitter errors if MongoDB disconnects or fails
    mongoose.connection.on('error', (err) => {
      console.warn(`[MongoDB] Connection error event (non-fatal): ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from MongoDB cluster.');
    });

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: false,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    console.log(
      `[MongoDB] Successfully connected to database host: ${conn.connection.host}, active database: ${conn.connection.name}`
    );
  } catch (error) {
    if (error.code === 8000 || error.message.includes('authentication failed')) {
      console.warn(
        '[MongoDB] Authentication Failed: Atlas rejected the database credentials in MONGO_URI. (Non-fatal, Supabase/fallback active)'
      );
    } else {
      console.warn(`[MongoDB] Connection failed (non-fatal): ${error.message}`);
    }
  }
};

module.exports = connectDB;