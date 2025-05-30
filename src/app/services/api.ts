import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
});

// Interceptor para identificar problemas na URL
api.interceptors.request.use((config) => {
  console.log("Realizando requisição para:", config.url);
  return config;
});

export default api;
