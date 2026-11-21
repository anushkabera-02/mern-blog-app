import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, RefreshCw, AlertTriangle, Layers, Box } from "lucide-react";
import { fetchPosts } from "../api/postsApi.js";
import PostCard from "../components/PostCard.jsx";

const CATEGORIES = ["All", "Technology", "DevOps", "Web Development", "Cloud & Docker", "General"];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // TanStack Query to fetch posts with caching, refetching, and state management
  const {
    data: posts = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["posts", { category: selectedCategory, search: debouncedSearch }],
    queryFn: () => fetchPosts({ category: selectedCategory, search: debouncedSearch }),
    staleTime: 1000 * 30, // 30 seconds fresh cache
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-6">
            <Box className="w-3.5 h-3.5" />
            <span>CSE 3395 Containerized Full-Stack Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Scalable Cloud Blog with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              MERN & TanStack
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Orchestrated with Docker Compose, automated via GitHub Actions CI/CD, and ready for deployment to Google Cloud Run and MongoDB Atlas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Publish Article
            </Link>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-sm font-medium backdrop-blur-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh Cache
            </button>
          </div>
        </div>

        {/* Decorative Grid / Blur */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Controls: Search & Category Filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles by title, content or author..."
            className="w-full pl-11 pr-24 py-3 bg-white rounded-2xl border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid or States */}
      <div>
        {isLoading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse"
              >
                <div className="h-44 bg-slate-200 rounded-xl w-full" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-4/5" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-rose-900">Failed to load articles</h3>
            <p className="text-sm text-rose-700 mt-1">
              {error?.message || "Could not reach the backend service. Ensure MongoDB and Express are running."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No articles found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              {selectedCategory !== "All" || debouncedSearch
                ? "Try clearing filters or search term to see more articles."
                : "Be the first developer to publish an article on this platform!"}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Write Article
            </Link>
          </div>
        ) : (
          /* Real Data Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
