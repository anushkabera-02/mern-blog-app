import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import postRoutes from "./routes/postRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Security HTTP headers
app.use(helmet());

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

// Root welcome route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Welcome to MERN Blog API",
    status: "healthy",
    docs: "/api/posts",
    health: "/api/health",
  });
});

// API Routes (supports /api/v1 as per textbook instructions and /api)
app.use("/api/v1", postRoutes);
app.use("/api", postRoutes);

// Catch-all 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
