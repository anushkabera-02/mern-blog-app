import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import postRoutes from "./routes/postRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers (configured to permit Google Fonts and CDN media)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
const allowedOrigin = process.env.CLIENT_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin === "*" ? "*" : allowedOrigin,
    credentials: true,
  })
);

// Logging in non-test environments
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes (supports /api/v1 as per textbook instructions and /api)
app.use("/api/v1", postRoutes);
app.use("/api", postRoutes);

// Detect built frontend directory (backend/public or frontend/dist)
const possibleDistPaths = [
  path.resolve(__dirname, "../public"),
  path.resolve(__dirname, "../../frontend/dist"),
];

const clientBuildPath = possibleDistPaths.find((p) =>
  fs.existsSync(path.join(p, "index.html"))
);

if (clientBuildPath) {
  // Serve static frontend assets
  app.use(express.static(clientBuildPath));

  // Serve React SPA index.html for all non-API GET requests
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // Fallback JSON only if no frontend build is present
  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "Welcome to MERN Blog API",
      status: "healthy",
      docs: "/api/posts",
      health: "/api/health",
    });
  });
}

// Catch-all 404 & Global Error Handling for API routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
