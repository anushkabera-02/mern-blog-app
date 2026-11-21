import React from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";

export default function PostCard({ post }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={post.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-blue-700 shadow-sm">
            {post.category || "Technology"}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime || 3} min read
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          <Link to={`/posts/${post._id}`}>{post.title}</Link>
        </h2>

        {/* Snippet */}
        <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer info: Author and Read link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              {(post.author || "A")[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-700">
              {post.author || "Anonymous"}
            </span>
          </div>

          <Link
            to={`/posts/${post._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform"
          >
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
