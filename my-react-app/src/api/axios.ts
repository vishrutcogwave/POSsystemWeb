import axios from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const baseURL = localStorage.getItem("baseUrl") || "";

  config.baseURL = baseURL;

  const token = localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { config, response } = error;

      const message = `
401 Unauthorized

Method: ${config?.method?.toUpperCase() || "N/A"}

URL: ${(config?.baseURL || "") + (config?.url || "")}

Status: ${response?.status || "N/A"}

Status Text: ${response?.statusText || "N/A"}

Response:
${JSON.stringify(response?.data, null, 2)}

Request Payload:
${config?.data || "N/A"}
      `;

      alert(message);

      console.error("401 Error Details:", {
        method: config?.method,
        url: (config?.baseURL || "") + (config?.url || ""),
        status: response?.status,
        statusText: response?.statusText,
        responseData: response?.data,
        requestData: config?.data,
      });

      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;