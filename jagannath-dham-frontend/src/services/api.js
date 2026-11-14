import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  // Do not attach an old JWT to public authentication requests
  const isPublicAuthRequest =
    config.url?.includes("/users/login") ||
    config.url?.includes("/users/register");

  if (isPublicAuthRequest) {
    delete config.headers.Authorization;
    return config;
  }

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
