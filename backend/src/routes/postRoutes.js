import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getHealth,
} from "../controllers/postController.js";
import { validatePost } from "../middleware/validatePost.js";

const router = express.Router();

// Health check
router.get("/health", getHealth);

// Post routes
router.route("/posts")
  .get(getPosts)
  .post(validatePost, createPost);

router.route("/posts/:id")
  .get(getPostById)
  .put(validatePost, updatePost)
  .delete(deletePost);

export default router;
