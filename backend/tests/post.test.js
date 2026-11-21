import request from "supertest";
import { jest } from "@jest/globals";

// Mock mongoose connection so tests don't require an external MongoDB instance
let mockPosts = [];

jest.unstable_mockModule("../src/models/Post.js", () => {
  const MockPost = function (doc) {
    Object.assign(this, doc);
    this._id = this._id || "507f1f77bcf86cd799439011";
    this.createdAt = this.createdAt || new Date().toISOString();
    this.updatedAt = this.updatedAt || new Date().toISOString();
    this.readTime = this.readTime || 2;
    this.save = jest.fn().mockImplementation(async () => {
      const idx = mockPosts.findIndex((p) => String(p._id) === String(this._id));
      if (idx !== -1) {
        mockPosts[idx] = this;
      }
      return this;
    });
    this.deleteOne = jest.fn().mockImplementation(async () => {
      mockPosts = mockPosts.filter((p) => String(p._id) !== String(this._id));
      return { acknowledged: true, deletedCount: 1 };
    });
  };

  MockPost.create = jest.fn().mockImplementation(async (data) => {
    const post = new MockPost({
      ...data,
      _id: "post_" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    });
    mockPosts.push(post);
    return post;
  });

  MockPost.find = jest.fn().mockImplementation((filter = {}) => {
    let result = [...mockPosts];
    if (filter.category && filter.category !== "All") {
      result = result.filter((p) => p.category === filter.category);
    }
    if (filter.$or) {
      const regex = filter.$or[0].title.$regex;
      const term = typeof regex === "string" ? regex.toLowerCase() : "";
      result = result.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(term)) ||
          (p.content && p.content.toLowerCase().includes(term))
      );
    }
    return {
      sort: jest.fn().mockResolvedValue(result),
    };
  });

  MockPost.findById = jest.fn().mockImplementation(async (id) => {
    return mockPosts.find((p) => String(p._id) === String(id)) || null;
  });

  MockPost.deleteMany = jest.fn().mockImplementation(async () => {
    mockPosts = [];
    return { acknowledged: true };
  });

  return {
    default: MockPost,
  };
});

// Import app after mocking model
const { default: app } = await import("../src/app.js");
const { default: Post } = await import("../src/models/Post.js");

beforeEach(async () => {
  await Post.deleteMany({});
});

describe("Health Check API", () => {
  it("should return 200 and healthy status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("mern-blog-backend");
  });
});

describe("Blog Posts API", () => {
  describe("POST /api/posts", () => {
    it("should create a new blog post with valid data", async () => {
      const payload = {
        title: "Dockerizing MERN Stack Applications",
        content: "Detailed tutorial on containerizing MongoDB, Express, React, and Node.js with Docker Compose.",
        author: "DevOps Engineer",
        category: "DevOps",
        tags: ["Docker", "MERN", "CI/CD"],
      };

      const res = await request(app).post("/api/posts").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.author).toBe(payload.author);
    });

    it("should reject creation if title or content is missing", async () => {
      const res = await request(app).post("/api/posts").send({
        author: "Tester",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain("Title is required and must not be empty");
      expect(res.body.errors).toContain("Content is required and must not be empty");
    });
  });

  describe("GET /api/posts", () => {
    beforeEach(async () => {
      await Post.create({
        title: "Kubernetes vs Docker Swarm",
        content: "Exploring container orchestration at scale in 2026.",
        author: "Alex",
        category: "DevOps",
        tags: ["Docker", "Kubernetes"],
      });
      await Post.create({
        title: "React Query and State Management",
        content: "Why TanStack Query is ideal for server state.",
        author: "Sarah",
        category: "Web Development",
        tags: ["React", "TanStack"],
      });
    });

    it("should return all posts", async () => {
      const res = await request(app).get("/api/posts");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
    });

    it("should filter posts by category", async () => {
      const res = await request(app).get("/api/posts?category=DevOps");
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].category).toBe("DevOps");
    });

    it("should filter posts by search query", async () => {
      const res = await request(app).get("/api/posts?search=State Management");
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toContain("React Query");
    });
  });

  describe("GET /api/posts/:id", () => {
    it("should return single post by ID", async () => {
      const post = await Post.create({
        title: "Test Single Post",
        content: "Testing single post retrieval.",
        author: "Tester",
      });

      const res = await request(app).get(`/api/posts/${post._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe(post.title);
    });

    it("should return 404 if post does not exist", async () => {
      const res = await request(app).get(`/api/posts/nonexistent_id`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/posts/:id", () => {
    it("should update an existing post", async () => {
      const post = await Post.create({
        title: "Original Title",
        content: "Original Content",
        author: "Original Author",
      });

      const res = await request(app).put(`/api/posts/${post._id}`).send({
        title: "Updated Title",
        content: "Updated Content with more details.",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
      expect(res.body.data.content).toBe("Updated Content with more details.");
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should delete an existing post", async () => {
      const post = await Post.create({
        title: "Post to be Deleted",
        content: "Content to be deleted.",
      });

      const res = await request(app).delete(`/api/posts/${post._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
