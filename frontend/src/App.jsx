import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import EditPostPage from "./pages/EditPostPage.jsx";
import { Terminal, ShieldCheck, Heart } from "lucide-react";

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        <Navbar />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/edit/:id" element={<EditPostPage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>
                CSE 3395 Web Application Projects with React – Academic Year 2026–2027
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dockerized & CI/CD Automated
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Crafted with <Heart className="w-3 h-3 text-rose-500 fill-current" /> for MERN
              </span>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
