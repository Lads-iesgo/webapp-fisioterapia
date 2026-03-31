//Importação do axios para requisições HTTP
import axios from "axios";

//Criação de uma instância do axios com a URL base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
});

//Interceptor para adicionar o token em todas requisições
api.interceptors.request.use(
  (config) => {
    //para debug de requisições
    //console.log("Realizando requisição para:", config.url);

    //Obter o token do cookie
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    //Para debug de token
    //Se necessário, descomente a linha abaixo para ver o token no console
    //console.log("Token encontrado:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignorar redirecionamento em 401 quando:
    // - a chamada for para o endpoint de login
    // - o header x-skip-auth-redirect for enviado
    const requestUrl: string | undefined = error?.config?.url;
    const skipRedirect = error?.config?.headers?.["x-skip-auth-redirect"] === "true";

    if (
      error?.response?.status === 401 &&
      !skipRedirect &&
      requestUrl &&
      !requestUrl.includes("/auth/login")
    ) {
      //Remover cookie de token usando abordagem compatível
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      //Redirecionar para login (se estiver no navegador)
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
