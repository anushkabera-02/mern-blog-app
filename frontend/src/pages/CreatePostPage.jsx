import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/postsApi.js";
import PostForm from "../components/PostForm.jsx";
import Notification from "../components/Notification.jsx";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState(null);

  // TanStack Query mutation for creating post
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      // Invalidate posts cache to trigger fresh fetch on feed
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(`/posts/${data._id}`);
    },
    onError: (err) => {
      const message =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Failed to publish article. Check backend connectivity.";
      setNotification({
        type: "error",
        message,
      });
    },
  });

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

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
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        titleText="Create New Article"
      />
    </div>
  );
}
