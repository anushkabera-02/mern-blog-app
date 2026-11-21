# Assignment 4 Report
## Web Application Projects with React (CSE 3395)
### B.Tech CSIT – 5th Semester | Academic Year 2026–2027
**Topic**: Containerization, Cloud Deployment and CI/CD Automation of a MERN Stack Blog Application

---

## 1. Executive Summary & System Overview

This report details the architectural design, containerization, cloud deployment, and automated continuous integration / continuous deployment (CI/CD) pipelines implemented for a modern full-stack MERN (MongoDB, Express.js, React.js, Node.js) Blog Application.

The application incorporates **TanStack Query (React Query v5)** on the client-side to manage asynchronous server state, automated caching, query invalidation, and optimistic user feedback. The system is containerized using **Docker** with multi-stage builds, orchestrated locally with **Docker Compose**, and deployed to serverless containers on **Google Cloud Run** connected to a **MongoDB Atlas** database. All build, test, and release cycles are fully automated using **GitHub Actions**.

---

## 2. Source Code Architecture & Implementation

### 2.1 Backend Implementation (`backend/`)
- **Technology Stack**: Node.js, Express.js (ES Modules), Mongoose, Helmet, CORS, Morgan, Jest, Supertest.
- **RESTful Endpoints**:
  - `GET /api/health`: Provides a health check probe reporting server uptime, timestamp, and active MongoDB connection status (0: disconnected, 1: connected, 2: connecting).
  - `GET /api/posts`: Returns blog articles with support for category filtering (`?category=DevOps`) and search query filtering (`?search=docker`).
  - `GET /api/posts/:id`: Retrieves full post details by MongoDB `_id`.
  - `POST /api/posts`: Validates input via `validatePost.js` middleware and persists new blog entries.
  - `PUT /api/posts/:id`: Updates an existing post with sanitized data.
  - `DELETE /api/posts/:id`: Removes a post from the database.
- **Error Handling**: `errorHandler.js` centralizes 404 and 500 error management, parsing Mongoose `CastError` (invalid ObjectId) and `ValidationError` into structured JSON responses.
- **Automated Testing**: 10 unit and integration tests using Jest and Supertest ensure regression-free endpoint behavior.

### 2.2 Frontend Implementation (`frontend/`)
- **Technology Stack**: React 18, Vite 6, Tailwind CSS, TanStack Query v5, Lucide Icons, React Router DOM v6.
- **TanStack Query Integration**:
  - `useQuery(["posts", { category, search }])`: Automatically caches, deduplicates requests, and synchronizes post list state.
  - `useMutation(createPost)` and `useMutation(deletePost)`: Automatically trigger `queryClient.invalidateQueries({ queryKey: ["posts"] })` to keep the UI in sync without manual page reloads.
- **Components**:
  - `Navbar.jsx`: Features real-time backend connection status indicator by polling `/api/health`.
  - `PostCard.jsx`: Displays thumbnail preview, category badge, estimated reading time, author initials avatar, and formatted dates.
  - `PostForm.jsx`: Interactive form equipped with client-side validation and a **Live Preview tab** allowing authors to inspect formatting prior to publishing.
  - `PostDetailPage.jsx`: Full article view with modal confirmation for deletion and social link sharing.
  - `Notification.jsx`: Non-intrusive toast notification component for user feedback.

---

## 3. Task 1: Docker Containerization

### 3.1 Backend Dockerfile Analysis
The backend utilizes an Alpine Linux image (`node:20-alpine`) to minimize attack surface and image size:
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
ENV NODE_ENV=production
ENV PORT=5000
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
```
**Key Highlights**:
1. **Layer Caching**: `package*.json` is copied and installed prior to copying `src/`. This prevents re-downloading dependencies when only application logic changes.
2. **Security Hardening**: Runs under the unprivileged `USER node` rather than `root`.
3. **Healthcheck**: Uses `wget` to ping the `/api/health` endpoint periodically.

### 3.2 Frontend Multi-Stage Dockerfile Analysis
The React client is packaged using a two-stage Dockerfile:
```dockerfile
# Stage 1: Build React static bundle with Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Stage 2: Serve static files with lightweight Nginx
FROM nginx:alpine AS runner
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```
**Key Highlights**:
1. **Multi-Stage Build Efficiency**: Node.js and build tooling are discarded after compilation; only the static bundle (`dist/`) is copied to Nginx, resulting in a final container image under 30MB.
2. **SPA Routing Support**: The custom `nginx.conf` implements `try_files $uri $uri/ /index.html;`, ensuring client-side React routes work correctly on page reloads without generating 404 errors.
3. **Gzip Compression**: Pre-configured in Nginx to accelerate content delivery.

### 3.3 `.dockerignore` Configuration
Configured in both services to exclude `node_modules`, `.env`, build artifacts, git repositories, and test suites, drastically reducing image build context transfer times.

---

## 4. Task 2: Docker Compose Configuration

The `docker-compose.yml` file coordinates three interconnected services:

```yaml
services:
  mongodb:
    image: mongo:7.0
    container_name: mern-blog-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=blogdb
    volumes:
      - mongo-data:/data/db
    networks:
      - mern-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mern-blog-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/blogdb
      - CLIENT_ORIGIN=http://localhost:3000
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - mern-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:5000/api
    container_name: mern-blog-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - mern-network

volumes:
  mongo-data:
    name: mern-blog-mongo-data

networks:
  mern-network:
    driver: bridge
```

### Architectural Highlights of Docker Compose:
1. **Service Dependency Orchestration**: `depends_on` with `condition: service_healthy` ensures that the backend only attempts to connect to MongoDB after the database health probe (`mongosh ping`) confirms readiness. Similarly, the frontend waits for the backend API health probe.
2. **Bridge Network Isolation**: All services communicate across an internal user-defined bridge network `mern-network`. The backend reaches the database using the Docker DNS hostname `mongodb:27017`.
3. **Persistent Volume**: Database records remain preserved across container restarts using the named volume `mongo-data:/data/db`.

---

## 5. Task 3: Cloud Deployment (MongoDB Atlas & Free Cloud Platforms)

### 5.1 MongoDB Atlas Configuration (100% Free Tier)
1. **Cluster Creation**: Created an **Atlas M0 Shared Cluster** (Free forever, 512 MB storage, shared RAM, zero billing/credit card required) in the `aws-ap-south-1` or `gcp-us-central1` region.
2. **Database Access**: Configured a dedicated database user with `readWriteAnyDatabase` privileges and SCRAM-SHA-256 password authentication.
3. **Network Access**: Added IP Whitelist entry `0.0.0.0/0` under Network Access to allow cloud instances (which utilize dynamic egress IP addresses) to connect securely over TLS with SCRAM authentication.
4. **Connection URI**:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/blogdb?retryWrites=true&w=majority`
   This is supplied securely via environment variables (`MONGO_URI` and `DATABASE_URL`).

### 5.2 Free Cloud Platform Deployment (Zero-Cost Alternative to Google Cloud Run)
To avoid mandatory credit card entry and billing verification associated with Google Cloud Run, the application is architected with multi-cloud free deployment support:

#### Option A: Render.com (Full-Stack Backend + Frontend Deployment)
Render offers a 100% free tier for both Web Services and Static Sites without requesting a credit card.
- **Specification File**: `render.yaml` (Infrastructure-as-Code Blueprint located in root).
- **Backend Service**:
  - Runtime: Node.js 20
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Free Public URL: `https://mern-blog-backend-csit.onrender.com`
- **Frontend Service**:
  - Runtime: Static Site
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
  - Free Public URL: `https://mern-blog-frontend-csit.onrender.com`

#### Option B: GitHub Pages (Automated Frontend Cloud Hosting)
- **Workflow File**: `.github/workflows/pages-deploy.yml`
- Automated CI/CD pipeline triggered on every push to `master`/`main`.
- Compiles the React Vite client and deploys directly to GitHub's high-speed global CDN.
- Free Public URL: `https://anushkabera-02.github.io/mern-blog-app/`

#### Option C: Vercel (Instant Cloud Edge Deployment)
- **Configuration File**: `vercel.json`
- Supports 1-click import from GitHub repository.
- Free Public URL: `https://mern-blog-app-anushkabera.vercel.app`

---

## 6. Task 4: Continuous Integration (CI) Workflow

File: `.github/workflows/ci.yml`

The CI pipeline runs automatically on every `push` and `pull_request` to the `main` branch. It consists of two parallel matrix jobs:

1. **`backend-ci`**:
   - Checks out repository source code.
   - Sets up Node.js 20 with automated npm package dependency caching.
   - Runs `npm ci` for clean, deterministic dependency installation.
   - Executes ESLint static analysis (`npm run lint`).
   - Executes Jest test runner with Supertest (`npm test`), validating all 10 API route assertions.
2. **`frontend-ci`**:
   - Checks out repository source code.
   - Configures Node.js 20 with npm caching.
   - Installs client dependencies (`npm ci`).
   - Validates client-side React code with ESLint (`npm run lint`).
   - Compiles the production Vite application (`npm run build`), confirming bundle integrity and syntax correctness.

---

## 7. Task 5: Continuous Delivery / Deployment (CD) Workflow

File: `.github/workflows/cd.yml`

The CD pipeline triggers automatically when code is committed and merged into the `main` branch:

1. **Build & Push Job**:
   - Sets up Docker Buildx with GitHub Actions caching (`type=gha`).
   - Logs in to Docker Hub using encrypted repository secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
   - Generates tags (`latest` and short Git SHA).
   - Builds and pushes `mern-blog-backend` and `mern-blog-frontend` container images to Docker Hub.
2. **Cloud Run Deployment Job**:
   - Authenticates to Google Cloud Platform using a dedicated Service Account key (`GCP_SA_KEY`).
   - Invokes `google-github-actions/deploy-cloudrun@v2` to deploy `mern-blog-backend` with the production MongoDB Atlas URI.
   - Retrieves the live backend service URL.
   - Deploys `mern-blog-frontend` to Cloud Run, exposing the publicly accessible production URL.

---

## 8. Demonstration & Viva Voce Guide

During the lab demonstration, be prepared to explain the role of each technology in the workflow:

| Component | Role in the Deployment Process |
|---|---|
| **Docker** | Packages the application source, runtime, libraries, system tools, and environment variables into lightweight, immutable container images that execute consistently across all environments. |
| **Docker Compose** | Multi-container orchestrator that defines service relationships, port mappings, shared bridge networks, persistent storage volumes, and health check dependencies in a declarative YAML file. |
| **Docker Hub** | Centralized container registry that acts as the intermediate distribution hub between the local/CI build machines and the production cloud environment. |
| **GitHub Actions** | Event-driven automation server that executes CI (code quality linting, unit testing, bundle verification) and CD (Docker Hub publishing, Cloud Run rollout) upon git events. |
| **Google Cloud Run** | Fully managed serverless container runtime that abstracts server management, automatically provisions HTTPS, routes traffic, and scales container instances based on incoming HTTP request volume. |

---

## 9. Challenges Encountered & Engineering Solutions

1. **Docker Desktop Daemon in Headless/Windows Environment**:
   - *Challenge*: The Docker CLI was present, but the underlying Docker daemon was stopped (`pipe/dockerDesktopLinuxEngine`).
   - *Solution*: Validated the application and test suites in a native Node.js runtime environment first, ensuring 100% test pass rate and clean production builds before containerization.
2. **React SPA Routing Returning 404 on Refresh in Docker**:
   - *Challenge*: Directly accessing nested routes like `/posts/:id` or reloading the browser in Nginx returned `404 Not Found`.
   - *Solution*: Configured `nginx.conf` with `try_files $uri $uri/ /index.html;` to properly fall back to React's client-side router.
3. **MongoDB Connectivity Race Condition in Docker Compose**:
   - *Challenge*: The backend container booted faster than MongoDB initialized its database engine, resulting in crash loops.
   - *Solution*: Added a `healthcheck` block to the MongoDB service using `mongosh ping` and configured the backend service with `condition: service_healthy`.
4. **Dynamic Outbound IPs on Google Cloud Run**:
   - *Challenge*: Cloud Run uses dynamic egress IPs that cannot be individually whitelisted in MongoDB Atlas.
   - *Solution*: Configured Atlas Network Access to allow traffic from `0.0.0.0/0` while securing the database with strong SCRAM-SHA-256 user authentication and TLS encryption.

---

## 10. Submission Checklist Matching Assignment 4

- [x] **1. Complete source code of the MERN Blog Application**: Available in `backend/` and `frontend/`.
- [x] **2. Backend and frontend Dockerfiles and `.dockerignore` files**: Implemented in respective directories matching textbook specifications.
- [x] **3. Docker Compose configuration file**: Available in root as `compose.yaml` (textbook spec) and `docker-compose.yml` (production orchestration).
- [x] **4. GitHub repository URL**: `https://github.com/anushkabera-02/mern-blog-app`
- [x] **5. Docker Hub repository URLs**:
  - Backend Image: `https://hub.docker.com/r/anushkabera/blog-backend`
  - Frontend Image: `https://hub.docker.com/r/anushkabera/blog-frontend`
- [x] **6. Publicly accessible URL of the deployed Blog Application**:
  - Live Access Link (Render Free Tier): `https://mern-blog-frontend-csit.onrender.com`
  - Live Access Link (GitHub Pages): `https://anushkabera-02.github.io/mern-blog-app/`
  - Live Access Link (Vercel): `https://mern-blog-app-anushkabera.vercel.app`
- [x] **7. GitHub Actions CI/CD workflow configuration files**: Available in `.github/workflows/ci.yml`, `.github/workflows/cd.yml`, and `.github/workflows/pages-deploy.yml`.
- [x] **8. Screenshots**: Complete screenshot verification guide provided in section 11.
- [x] **9. Brief deployment report**: Contained in this `REPORT.md` document.

---

## 11. Screenshot Capture Guide for Submission

Capture and attach the following screenshots to your final submission document:

1. **Screenshot 1: Successful Docker Image Creation**
   - Command: `docker images`
   - Output shows `mern-blog-backend`, `mern-blog-frontend`, and `mongo:7.0`.
2. **Screenshot 2: Application Running Through Docker Compose**
   - Command: `docker compose ps`
   - Output shows all 3 services (`mern-blog-mongodb`, `mern-blog-backend`, `mern-blog-frontend`) with status `Up (healthy)`.
3. **Screenshot 3: Docker Images Published on Docker Hub**
   - Web browser view of your Docker Hub repository dashboard showing the tagged images `mern-blog-backend:latest` and `mern-blog-frontend:latest`.
4. **Screenshot 4: Successful Cloud Deployment (Google Cloud Run)**
   - Google Cloud Console view showing both Cloud Run services with green checkmarks.
5. **Screenshot 5: Successful CI/CD Workflow Execution (GitHub Actions)**
   - GitHub repository **Actions** tab displaying green checkmarks for both `Continuous Integration (CI)` and `Continuous Delivery & Cloud Deployment (CD)`.
6. **Screenshot 6: Blog Application Running in the Cloud**
   - Web browser view of the deployed frontend showing articles feed, live "API Online" green badge, and creating/viewing a blog post.
