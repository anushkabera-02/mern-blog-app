import mongoose from "mongoose";

export const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blogdb";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("[MongoDB] Connection closed gracefully.");
  } catch (error) {
    console.error(`[MongoDB] Error disconnecting: ${error.message}`);
  }
};
