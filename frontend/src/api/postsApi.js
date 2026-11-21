import axios from "axios";

// Supports VITE_BACKEND_URL (from textbook instructions), VITE_API_URL, or relative /api
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const fetchPosts = async ({ category, search } = {}) => {
  const params = {};
  if (category && category !== "All") params.category = category;
  if (search && search.trim()) params.search = search.trim();

  const response = await apiClient.get("/posts", { params });
  return response.data.data;
};

export const fetchPostById = async (id) => {
  const response = await apiClient.get(`/posts/${id}`);
  return response.data.data;
};

export const createPost = async (postData) => {
  const response = await apiClient.post("/posts", postData);
  return response.data.data;
};

export const updatePost = async ({ id, postData }) => {
  const response = await apiClient.put(`/posts/${id}`, postData);
  return response.data.data;
};

export const deletePost = async (id) => {
  const response = await apiClient.delete(`/posts/${id}`);
  return response.data.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};
