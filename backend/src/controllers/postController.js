import mongoose from "mongoose";
import Post from "../models/Post.js";

// @desc    Get all blog posts (with optional category and search filters)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
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

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
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

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: newPost,
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

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedPost,
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Health check endpoint for Docker & Cloud Run probes
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
  });
};
