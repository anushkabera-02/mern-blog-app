import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Tag,
  AlertTriangle,
  Share2,
} from "lucide-react";
import { fetchPostById, deletePost } from "../api/postsApi.js";
import Notification from "../components/Notification.jsx";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch single post
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
  });

  // Delete mutation with TanStack Query
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      // Invalidate posts list cache so feed refreshes instantly
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
    onError: (err) => {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to delete post",
      });
      setShowDeleteModal(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotification({
        type: "success",
        message: "Link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-96 bg-slate-200 rounded-3xl w-full" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Article not found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {error?.message || "The article you are looking for does not exist or has been removed."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Share article"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <Link
            to={`/edit/${post._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Hero Cover */}
      <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-xl bg-slate-100">
        <img
          src={post.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/95 text-blue-700 shadow-md">
            {post.category || "Technology"}
          </span>
        </div>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pt-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {(post.author || "A")[0].toUpperCase()}
            </div>
            <span className="font-semibold text-slate-800">
              {post.author || "Anonymous"}
            </span>
          </div>

          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formattedDate}
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            {post.readTime || 3} min read
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="prose prose-slate max-w-none text-slate-800 text-lg leading-relaxed whitespace-pre-line py-4">
        {post.content}
      </div>

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Article Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Delete this article?
            </h3>

            <p className="text-sm text-slate-500 text-center">
              This action cannot be undone. This post will be permanently removed from MongoDB.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
