import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:1001/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`🔵 Admin API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
  return config;
});

API.interceptors.response.use((response) => {
  console.log(`🟢 Admin API Response: ${response.config.url}`, response.data);
  return response;
}, (error) => {
  console.error(`🔴 Admin API Error: ${error.config?.url}`, error);
  return Promise.reject(error);
});

export default API;