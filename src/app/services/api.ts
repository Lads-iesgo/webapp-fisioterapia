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
	},
);

//Interceptor para tratamento de respostas
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const requestURL: string | undefined = error.config?.url;
		const skiptRedirect =
			error?.config?.headers?.["x-skipt-auth-redirect"] === "true";

		// Tratamento de erro 401 (Não autenticado)
		if (
			error?.response?.status === 401 &&
			!skiptRedirect &&
			requestURL &&
			!requestURL.includes("/auth/refresh-token")
		) {
			// Limpar token do cookie
			document.cookie =
				"token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

			// Limpar dados do localStorage
			localStorage.removeItem("userData");

			// Redirecionar para login
			if (
				typeof window !== "undefined" &&
				window.location.pathname !== "/login"
			) {
				// Armazenar mensagem de sessão expirada
				sessionStorage.setItem("sessionExpired", "true");
				window.location.href = "/login";
			}
		}

		// Tratamento de erro 403 (Sem permissão)
		if (error?.response?.status === 403) {
			console.error(
				"Acesso negado: Você não tem permissão para realizar esta ação",
			);

			// Você pode adicionar uma notificação global aqui
			if (typeof window !== "undefined") {
				// Armazenar mensagem de permissão negada
				sessionStorage.setItem("permissionDenied", "true");
			}
		}

		return Promise.reject(error);
	},
);

export default api;
