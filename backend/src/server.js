import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP listener
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`===============================================`);
      console.log(` MERN Blog API Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Posts endpoint: http://localhost:${PORT}/api/posts`);
      console.log(`===============================================`);
    });

    // Graceful shutdown listeners
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log("[Server] Process terminated.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
