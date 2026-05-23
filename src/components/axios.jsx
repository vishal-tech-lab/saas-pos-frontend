import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080" });

api.interceptors.request.use((config) => {
  const tenant = localStorage.getItem("tenant");
  if (tenant) config.headers["X-Tenant-ID"] = tenant;
  return config;
});

export default api;