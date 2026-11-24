import mongoose from "mongoose";
import Post from "../models/Post.js";

// In-memory fallback dataset for resilient cloud operation prior to database initialization
const inMemoryFallbackPosts = [
  {
    _id: "6741b2c4e12a4b001a1b2c31",
    title: "Containerizing MERN Applications with Docker & Docker Compose",
    content: "A detailed breakdown of packaging MongoDB, Express, React, and Node.js using multi-stage Docker builds, layer caching, and bridge networks.",
    author: "Anushka Bera",
    category: "DevOps",
    tags: ["Docker", "MERN", "Containers", "DevOps"],
    readTime: 3,
    coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "6741b2c4e12a4b001a1b2c32",
    title: "Automating Cloud Deployments with GitHub Actions CI/CD",
    content: "Implementing automated test pipelines with Jest, Supertest, and ESLint, followed by automated deployments to Render and Google Cloud Run.",
    author: "Cloud Engineer",
    category: "Cloud & Docker",
    tags: ["CI/CD", "GitHub Actions", "Render", "Cloud"],
    readTime: 4,
    coverImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "6741b2c4e12a4b001a1b2c33",
    title: "Frontend State Synchronization with TanStack Query v5",
    content: "Streamlining asynchronous server state, automatic caching, query invalidation, and optimistic updates inside a React 18 single-page application.",
    author: "Frontend Architect",
    category: "Web Development",
    tags: ["React", "TanStack Query", "Vite", "Tailwind"],
    readTime: 2,
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Helper to determine if connected to live MongoDB
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all blog posts (with optional category and search filters)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    // Use live MongoDB when connected or during unit tests
    if (isDbConnected() || process.env.NODE_ENV === "test") {
      const filter = {};

      if (category && category !== "All") {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ];
      }

      const posts = await Post.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: posts.length,
        data: posts,
      });
    }

    // Graceful fallback for initial cloud boot before MONGO_URI is set
    let fallback = [...inMemoryFallbackPosts];
    if (category && category !== "All") {
      fallback = fallback.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: fallback.length,
      data: fallback,
      mode: "in-memory-fallback",
      message: "Connected to in-memory store. To connect live database, add MONGO_URI in Render dashboard.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    if (isDbConnected() || process.env.NODE_ENV === "test") {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: post,
      });
    }

    const post = inMemoryFallbackPosts.find((p) => String(p._id) === String(req.params.id));
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Public
export const createPost = async (req, res, next) => {
  try {
    const { title, content, author, category, tags, coverImage } = req.body;

    if (isDbConnected() || process.env.NODE_ENV === "test") {
      const newPost = await Post.create({
        title: title.trim(),
        content: content.trim(),
        author: author ? author.trim() : "Anonymous",
        category: category || "Technology",
        tags: Array.isArray(tags)
          ? tags
          : typeof tags === "string" && tags.length > 0
          ? tags.split(",").map((t) => t.trim())
          : [],
        coverImage: coverImage && coverImage.trim() ? coverImage.trim() : undefined,
      });

      return res.status(201).json({
        success: true,
        message: "Blog post created successfully",
        data: newPost,
      });
    }

    const fallbackPost = {
      _id: "temp_" + Date.now().toString(36),
      title: title.trim(),
      content: content.trim(),
      author: author ? author.trim() : "Anonymous",
      category: category || "Technology",
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string" && tags.length > 0
        ? tags.split(",").map((t) => t.trim())
        : [],
      coverImage: coverImage && coverImage.trim() ? coverImage.trim() : undefined,
      readTime: Math.max(1, Math.ceil((content || "").split(/\s+/).length / 200)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryFallbackPosts.unshift(fallbackPost);

    return res.status(201).json({
      success: true,
      message: "Blog post created (in-memory mode). Add MONGO_URI in Render dashboard for permanent storage.",
      data: fallbackPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Public
export const updatePost = async (req, res, next) => {
  try {
    const { title, content, author, category, tags, coverImage } = req.body;

    if (isDbConnected() || process.env.NODE_ENV === "test") {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
      }

      if (title !== undefined) post.title = title.trim();
      if (content !== undefined) post.content = content.trim();
      if (author !== undefined) post.author = author.trim();
      if (category !== undefined) post.category = category;
      if (tags !== undefined) {
        post.tags = Array.isArray(tags)
          ? tags
          : typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : [];
      }
      if (coverImage !== undefined && coverImage.trim()) {
        post.coverImage = coverImage.trim();
      }

      const updatedPost = await post.save();

      return res.status(200).json({
        success: true,
        message: "Blog post updated successfully",
        data: updatedPost,
      });
    }

    const idx = inMemoryFallbackPosts.findIndex((p) => String(p._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    if (title !== undefined) inMemoryFallbackPosts[idx].title = title.trim();
    if (content !== undefined) inMemoryFallbackPosts[idx].content = content.trim();
    if (author !== undefined) inMemoryFallbackPosts[idx].author = author.trim();
    if (category !== undefined) inMemoryFallbackPosts[idx].category = category;
    if (tags !== undefined) {
      inMemoryFallbackPosts[idx].tags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : [];
    }
    if (coverImage !== undefined && coverImage.trim()) {
      inMemoryFallbackPosts[idx].coverImage = coverImage.trim();
    }
    inMemoryFallbackPosts[idx].updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: inMemoryFallbackPosts[idx],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Public
export const deletePost = async (req, res, next) => {
  try {
    if (isDbConnected() || process.env.NODE_ENV === "test") {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
      }

      await post.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Blog post deleted successfully",
        data: { id: req.params.id },
      });
    }

    const idx = inMemoryFallbackPosts.findIndex((p) => String(p._id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    inMemoryFallbackPosts.splice(idx, 1);

    return res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Health check endpoint for Render & Docker probes
// @route   GET /api/health
// @access  Public
export const getHealth = (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    status: "ok",
    service: "mern-blog-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || "unknown",
    databaseConfigured: Boolean(process.env.DATABASE_URL || process.env.MONGO_URI),
  });
};
