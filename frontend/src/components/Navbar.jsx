import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PenSquare, Layers, Activity, BookOpen } from "lucide-react";
import { checkHealth } from "../api/postsApi.js";

export default function Navbar() {
  const location = useLocation();

  // Query API health to show live backend connectivity status
  const { data: health, isSuccess, isError } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: checkHealth,
    refetchInterval: 15000,
    retry: false,
  });

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              MERN<span className="text-blue-600">Blog</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Dockerized
            </span>
          </div>
        </Link>

        {/* Center / Right Navigation */}
        <div className="flex items-center gap-4">
          {/* Health Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-50"
            title={
              isSuccess
                ? `Backend Online (Uptime: ${Math.round(health?.uptime || 0)}s)`
                : isError
                ? "Backend Unreachable"
                : "Checking Backend..."
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSuccess
                  ? "bg-emerald-500 animate-pulse"
                  : isError
                  ? "bg-rose-500"
                  : "bg-amber-400"
              }`}
            />
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline text-slate-600">
              {isSuccess ? "API Online" : isError ? "API Offline" : "Connecting"}
            </span>
          </div>

          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === "/"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Articles</span>
          </Link>

          <Link
            to="/create"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm shadow-blue-500/30 transition-all"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write Post</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
