import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPostById, updatePost } from "../api/postsApi.js";
import PostForm from "../components/PostForm.jsx";
import Notification from "../components/Notification.jsx";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState(null);

  // Fetch current post data
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
  });

  // TanStack Query mutation for update
  const updateMutation = useMutation({
    mutationFn: (updatedData) => updatePost({ id, postData: updatedData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      navigate(`/posts/${id}`);
    },
    onError: (err) => {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to update article.",
      });
    },
  });

  const handleSubmit = (formData) => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading post details...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-rose-600 font-semibold">Post could not be loaded for editing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <PostForm
        initialData={post}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        titleText="Edit Article"
      />
    </div>
  );
}
