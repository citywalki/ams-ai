import axios from "axios";

export const restClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

restClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
