import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://microcourses-lms.onrender.com";

// Then:


const API = axios.create({
  baseURL: API_BASE,
});

// ✅ Add token automatically (if available)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
