import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: String,
      default: "Anonymous",
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      enum: ["Technology", "DevOps", "Web Development", "Cloud & Docker", "General"],
      default: "Technology",
    },
    tags: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
    },
    readTime: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate read time before save if content is present
postSchema.pre("save", function (next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const words = this.content.trim().split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / wordsPerMinute));
  }
  next();
});

const Post = mongoose.model("Post", postSchema);

export default Post;
