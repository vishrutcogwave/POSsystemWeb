import axios from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach baseURL and token dynamically
api.interceptors.request.use((config) => {
  const baseURL =
    localStorage.getItem("baseUrl") || "https://localhost:5001/api";

  config.baseURL = baseURL;

  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;