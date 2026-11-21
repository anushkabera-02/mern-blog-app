import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blogdb";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Anonymous" },
    category: { type: String, default: "Technology" },
    tags: [String],
    coverImage: String,
    readTime: Number,
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

const samplePosts = [
  {
    title: "Containerization of MERN Stack Applications with Docker & Docker Compose",
    content: `Containerization has revolutionized modern web software delivery. In this comprehensive guide, we explore how to bundle a full MERN (MongoDB, Express, React, Node.js) application into portable Docker containers.

By utilizing multi-stage builds for the React frontend, we achieve extremely compact Nginx production images that serve static assets with sub-millisecond latency. On the backend, Node.js runs as a secure, unprivileged user inside an Alpine Linux container.

With Docker Compose, orchestrating all three services—including a persistent MongoDB volume and bridge network—requires just a single command: 'docker compose up --build'.`,
    author: "B.Tech CSIT Engineer",
    category: "Cloud & Docker",
    tags: ["Docker", "MERN", "DevOps", "Containers"],
    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60",
    readTime: 4,
  },
  {
    title: "Automating Full-Stack CI/CD Pipelines with GitHub Actions",
    content: `Continuous Integration and Continuous Deployment (CI/CD) eliminates manual release friction and prevents regressions before they reach staging or production environments.

Our GitHub Actions workflow is split into two specialized pipelines:
1. CI Pipeline: Automatically triggered on all pull requests and pushes to validate dependencies, enforce ESLint code styling rules, and execute backend Jest unit/integration tests.
2. CD Pipeline: Automatically builds multi-platform Docker container images, publishes them to Docker Hub, and triggers blue-green rollouts on Google Cloud Run.

With encrypted GitHub Secrets, sensitive credentials such as Docker Hub access tokens and Google Cloud Service Account keys remain safeguarded at all times.`,
    author: "DevOps Specialist",
    category: "DevOps",
    tags: ["CI/CD", "GitHub Actions", "Automation", "Testing"],
    coverImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60",
    readTime: 5,
  },
  {
    title: "Deploying Serverless Containers to Google Cloud Run",
    content: `Google Cloud Run provides a scalable, fully managed compute platform that executes stateless containers directly on Google's global infrastructure.

Unlike traditional virtual machines, Cloud Run offers automatic horizontal scaling—including scaling down to zero when idle to minimize infrastructure expenditure. Each revision is uniquely versioned, enabling instant rollbacks and seamless canary traffic splitting.

By configuring Cloud Run environment variables for our MongoDB Atlas connection string and React API endpoints, our MERN application delivers enterprise-grade reliability and low-latency worldwide availability.`,
    author: "Cloud Architect",
    category: "Cloud & Docker",
    tags: ["Google Cloud", "Cloud Run", "Serverless", "GCP"],
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
    readTime: 4,
  },
  {
    title: "Modern Frontend Data Fetching with TanStack Query v5",
    content: `State management in React historically required complex boilerplate stores. TanStack Query (React Query) fundamentally simplifies client architectures by separating server state from UI state.

Key capabilities demonstrated in this application:
- Automatic background caching and deduplication of network requests
- Query invalidation upon successful post mutations (Create, Update, Delete)
- Built-in loading skeletons and intuitive error handling
- Zero-overhead state synchronization across components

Integrating TanStack Query ensures snappy, optimistic UI updates and resilient offline or slow network handling for our blog users.`,
    author: "Frontend Lead",
    category: "Web Development",
    tags: ["React", "TanStack Query", "State Management", "Vite"],
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
    readTime: 3,
  },
  {
    title: "Production MongoDB Atlas Configuration and Best Practices",
    content: `MongoDB Atlas provides managed cloud database hosting with built-in replication, automated backups, and encryption at rest.

When transitioning from local Docker MongoDB to production Atlas:
1. Configure an M0 free tier or dedicated cluster in your target GCP or AWS region.
2. Establish Database Access user credentials with readWrite permissions.
3. Configure Network Access IP whitelist (allow 0.0.0.0/0 for Google Cloud Run ephemeral dynamic outbound IPs).
4. Supply the connection URI securely via environment variables without hardcoding secrets.`,
    author: "Database Administrator",
    category: "Technology",
    tags: ["MongoDB", "Atlas", "Database", "Security"],
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60",
    readTime: 3,
  },
];

async function seed() {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected successfully.");

    await Post.deleteMany({});
    console.log("[Seed] Cleared existing posts.");

    const inserted = await Post.insertMany(samplePosts);
    console.log(`[Seed] Successfully inserted ${inserted.length} sample posts!`);

    await mongoose.connection.close();
    console.log("[Seed] Connection closed.");
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
}

seed();
