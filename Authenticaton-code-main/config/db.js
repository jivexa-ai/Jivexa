import mongoose from "mongoose";

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!primaryUri) {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/jivexa_auth', { serverSelectionTimeoutMS: 2000 });
      console.log(`[MongoDB Connected]: Connected to local MongoDB database`);
      return;
    } catch (e) {
      console.log("[MongoDB Notice]: Local MongoDB service not running. Initializing isolated In-Memory database for local session...");
      try {
        process.env.MONGOMS_TIMEOUT = '60000';
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: {
            launchTimeout: 60000
          }
        });
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB In-Memory Connected]: Active at ${memUri}`);
        return;
      } catch (err) {
        console.warn("[MongoDB Startup Warning]: MongoMemoryServer start failed:", err.message);
      }
    }
  }

  try {
    await mongoose.connect(primaryUri);
    console.log(`[MongoDB Connected]: Connected to database`);
  } catch (err) {
    console.error("[MongoDB Fatal]: Database connection failed:", err.message);
    throw err;
  }
};

export default connectDB;