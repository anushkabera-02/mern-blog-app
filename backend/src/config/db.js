import mongoose from "mongoose";

let isConnecting = false;
let retryInterval = null;

export const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.DATABASE_URL || process.env.MONGO_URI;

  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[MongoDB] Notice: 'MONGO_URI' / 'DATABASE_URL' is not set in Render environment variables.`);
      console.warn(`[MongoDB] Running with in-memory fallback. To enable cloud persistence, add 'MONGO_URI' in Render Dashboard -> Environment.`);
      return null;
    }
  }

  // Fallback to local MongoDB in local development
  const targetUri = uri || "mongodb://127.0.0.1:27017/blogdb";

  if (isConnecting || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    isConnecting = false;

    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }

    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB] Connection error: ${error.message}`);

    if (process.env.NODE_ENV === "production" && !uri) {
      console.warn(`[MongoDB] Cloud note: Cloud instances do not run MongoDB on 127.0.0.1:27017. Please set 'MONGO_URI' in Render Dashboard -> Environment.`);
    }

    // In production or development (non-test), schedule background reconnection without killing process
    if (process.env.NODE_ENV !== "test" && !retryInterval && uri) {
      retryInterval = setInterval(async () => {
        if (mongoose.connection.readyState === 0) {
          console.log(`[MongoDB] Retrying connection to database...`);
          try {
            await connectDB(customUri);
          } catch {
            // Error logged inside connectDB
          }
        }
      }, 15000);
    }

    if (process.env.NODE_ENV === "test") {
      throw error;
    }

    return null;
  }
};

export const disconnectDB = async () => {
  try {
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
    await mongoose.connection.close();
    console.log("[MongoDB] Connection closed gracefully.");
  } catch (error) {
    console.error(`[MongoDB] Error disconnecting: ${error.message}`);
  }
};
