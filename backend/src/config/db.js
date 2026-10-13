const mongoose = require('mongoose');

let isConnecting = false;
let connectionError = null;

/**
 * Validate MongoDB URI format and ensure no empty or placeholder strings
 */
const isMongoConfigured = () => {
  const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';
  if (!uri) return false;
  if (uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster>')) return false;
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
};

/**
 * Connect to MongoDB Atlas via Mongoose
 */
const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Prevent concurrent connection attempts
  if (isConnecting || mongoose.connection.readyState === 2) {
    console.log('[MongoDB] Connection attempt already in progress...');
    return null;
  }

  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!mongoUri || !isMongoConfigured()) {
    connectionError = 'MONGO_URI is not configured or contains placeholder credentials';
    console.warn(`[MongoDB Warning] ${connectionError}. Please set a valid MONGO_URI in .env`);
    return null;
  }

  isConnecting = true;
  connectionError = null;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    isConnecting = false;
    connectionError = null;
    // Mask URI for safe logging - never expose credentials
    const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name} (${maskedUri})`);

    return conn.connection;
  } catch (error) {
    isConnecting = false;
    connectionError = error.message;
    console.error(`[MongoDB Connection Error] Failed to connect: ${error.message}`);
    return null;
  }
};

/**
 * Check whether database is actively connected
 */
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Comprehensive health probe for health endpoints
 * Never reports success if connection has failed or is disconnected.
 */
const checkDatabaseHealth = async () => {
  const configured = isMongoConfigured();
  const readyState = mongoose.connection.readyState;

  if (!configured) {
    return {
      configured: false,
      connected: false,
      database: 'MongoDB Atlas',
      state: 'UNCONFIGURED',
      message: connectionError || 'MONGO_URI not configured in backend environment'
    };
  }

  if (readyState !== 1) {
    const stateMap = { 0: 'DISCONNECTED', 2: 'CONNECTING', 3: 'DISCONNECTING' };
    return {
      configured: true,
      connected: false,
      database: 'MongoDB Atlas',
      state: stateMap[readyState] || 'DISCONNECTED',
      message: connectionError || 'MongoDB is not currently connected'
    };
  }

  try {
    // Perform genuine ping to verify active database responsiveness
    await mongoose.connection.db.admin().ping();
    return {
      configured: true,
      connected: true,
      database: 'MongoDB Atlas',
      state: 'CONNECTED',
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      message: 'MongoDB Atlas connected and responsive'
    };
  } catch (pingErr) {
    return {
      configured: true,
      connected: false,
      database: 'MongoDB Atlas',
      state: 'UNRESPONSIVE',
      error: pingErr.message,
      message: 'MongoDB connection established but ping failed'
    };
  }
};

/**
 * Graceful shutdown handler
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close(false);
      console.log('[MongoDB] Connection closed gracefully.');
    } catch (err) {
      console.error('[MongoDB] Error during disconnection:', err.message);
    }
  }
};

// Handle process termination events for clean connection cleanup
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  isMongoConfigured,
  isDatabaseConnected,
  checkDatabaseHealth
};

