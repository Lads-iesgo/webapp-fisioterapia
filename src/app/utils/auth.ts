import { jwtDecode } from "jwt-decode";

/**
 * Interface do payload do token JWT
 */
export interface TokenPayload {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	iat: number;
	exp: number;
}

/**
 * Interface de informações do usuário
 */
export interface UserInfo {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
}

/**
 * Decodifica o token JWT e retorna o payload
 * @returns TokenPayload ou null se o token for inválido
 */
export function getTokenPayload(): TokenPayload | null {
	try {
		// Tentar obter o token do cookie
		const token = document.cookie
			.split("; ")
			.find((row) => row.startsWith("token="))
			?.split("=")[1];

		if (!token) {
			return null;
		}

		const decoded = jwtDecode<TokenPayload>(token);
		
		// Verificar se o token tem os campos necessários
		if (!decoded || !decoded.role || !decoded.email || !decoded.id) {
			console.error("Token inválido: campos obrigatórios ausentes");
			return null;
		}

		return decoded;
	} catch (error) {
		console.error("Erro ao decodificar token:", error);
		return null;
	}
}

/**
 * Obtém o role do usuário atual
 * @returns string com o role ou null se não autenticado
 */
export function getUserRole(): string | null {
	const payload = getTokenPayload();
	return payload?.role || null;
}

/**
 * Obtém as informações do usuário atual
 * @returns UserInfo ou null se não autenticado
 */
export function getUserInfo(): UserInfo | null {
	const payload = getTokenPayload();
	if (!payload) return null;

	return {
		id: payload.id,
		email: payload.email,
		role: payload.role,
		perfil_id: payload.perfil_id,
	};
}

/**
 * Verifica se o token está expirado
 * @returns boolean indicando se o token está expirado
 */
export function isTokenExpired(): boolean {
	const payload = getTokenPayload();
	if (!payload) return true;

	const currentTime = Math.floor(Date.now() / 1000);
	return payload.exp < currentTime;
}

/**
 * Verifica se o usuário está autenticado
 * @returns boolean indicando se há um token válido
 */
export function isAuthenticated(): boolean {
	const payload = getTokenPayload();
	return payload !== null && !isTokenExpired();
}

/**
 * Remove o token e limpa dados do usuário
 */
export function logout(): void {
	// Remover token do cookie
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

	// Limpar localStorage
	localStorage.removeItem("userData");

	// Redirecionar para login
	if (typeof window !== "undefined") {
		window.location.href = "/login";
	}
}

/**
 * Verifica se o usuário tem permissão para uma ação específica
 * @param resource - Recurso (ex: 'paciente', 'user', 'horario', 'consulta')
 * @param action - Ação (ex: 'read', 'update', 'delete')
 * @param scope - Escopo (ex: 'any', 'own')
 * @returns boolean indicando se o usuário tem permissão
 */
export function hasPermission(
	resource: string,
	action: string,
	scope: "any" | "own" = "any",
): boolean {
	const role = getUserRole();
	if (!role) return false;

	// Alunos têm permissões limitadas apenas para leitura própria
	if (role === "aluno") {
		if (scope === "own" && action === "read") {
			return ["paciente", "horario", "user"].includes(resource);
		}
		return false;
	}

	// Professor, coordenador e admin têm acesso completo
	if (["professor", "coordenador", "admin"].includes(role)) {
		return true;
	}

	return false;
}

/**
 * Verifica se o usuário pode criar/atualizar um recurso
 * @param resource - Recurso (ex: 'paciente', 'user', 'horario', 'consulta')
 * @returns boolean indicando se o usuário pode criar/atualizar
 */
export function canUpdate(resource: string): boolean {
	return hasPermission(resource, "update", "any");
}

/**
 * Verifica se o usuário pode deletar um recurso
 * @param resource - Recurso (ex: 'paciente', 'user', 'horario', 'consulta')
 * @returns boolean indicando se o usuário pode deletar
 */
export function canDelete(resource: string): boolean {
	return hasPermission(resource, "delete", "any");
}

/**
 * Verifica se o usuário pode ler um recurso
 * @param resource - Recurso (ex: 'paciente', 'user', 'horario', 'consulta')
 * @returns boolean indicando se o usuário pode ler
 */
export function canRead(resource: string): boolean {
	return hasPermission(resource, "read", "any");
}
