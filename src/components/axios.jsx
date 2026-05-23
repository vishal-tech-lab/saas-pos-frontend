import axios from "axios";

const api = axios.create({ baseURL: "https://saas-pos-backend-m8et.onrender.com" });

api.interceptors.request.use((config) => {
  const tenant = localStorage.getItem("tenant");
  if (tenant) config.headers["X-Tenant-ID"] = tenant;
  return config;
});

export default api;