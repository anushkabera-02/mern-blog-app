import { useState } from "react";
import { Sparkles, Eye, Edit3, Send } from "lucide-react";

const CATEGORIES = [
  "Technology",
  "DevOps",
  "Web Development",
  "Cloud & Docker",
  "General",
];

const SAMPLE_COVERS = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
];

export default function PostForm({ initialData = {}, onSubmit, isSubmitting, titleText = "Create New Article" }) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    author: initialData.author || "",
    category: initialData.category || "Technology",
    coverImage: initialData.coverImage || SAMPLE_COVERS[0],
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags || "",
    content: initialData.content || "",
  });

  const [activeTab, setActiveTab] = useState("edit");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Article title is required";
    else if (formData.title.length > 200) newErrors.title = "Title cannot exceed 200 characters";

    if (!formData.content.trim()) newErrors.content = "Article content is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tagsArray = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    onSubmit({
      ...formData,
      tags: tagsArray,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            {titleText}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish your article to the cloud-native blog platform.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "edit"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Mastering Container Orchestration with Docker Compose"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Author & Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Author Name
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Jane Developer"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image & Presets */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Cover Image URL</span>
              <span className="text-xs font-normal text-slate-400">
                Paste URL or choose a preset
              </span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Presets */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {SAMPLE_COVERS.map((preset, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: preset }))}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    formData.coverImage === preset
                      ? "border-blue-600 ring-2 ring-blue-500/30 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tags <span className="text-xs font-normal text-slate-400">(Comma separated)</span>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Docker, CI/CD, React, CloudRun"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Article Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the full content of your article here..."
              className={`w-full px-4 py-3 rounded-xl border text-sm font-normal focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                errors.content
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
            {errors.content && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.content}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      ) : (
        /* Preview Tab */
        <div className="mt-8 space-y-6">
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={formData.coverImage || SAMPLE_COVERS[0]}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-blue-700 shadow">
                {formData.category}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900">
            {formData.title || "Your Article Title Goes Here"}
          </h2>

          <div className="flex items-center gap-3 text-sm text-slate-500 pb-4 border-b">
            <span>By {formData.author || "Anonymous"}</span>
            <span>•</span>
            <span>Just now</span>
          </div>

          <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base">
            {formData.content || "Your article content will be displayed here in full..."}
          </div>
        </div>
      )}
    </div>
  );
}
