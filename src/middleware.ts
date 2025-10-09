import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// Interface do payload do token
interface TokenPayload {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	iat: number;
	exp: number;
}

// Rotas que requerem autenticação
const protectedRoutes = [
	"/home",
	"/disponibilidade",
	"/cadastroPaciente",
	"/cadastroUsuario",
	"/cadastroConsulta",
];
// Rotas públicas (não requerem autenticação)
const publicRoutes = ["/login", "/recuperar-senha"];

// Definição de permissões por rota e role
const routePermissions: Record<string, string[]> = {
	"/cadastroPaciente": ["professor", "coordenador", "admin"],
	"/cadastroUsuario": ["professor", "coordenador", "admin"],
	"/cadastroConsulta": ["professor", "coordenador", "admin"],
	"/disponibilidade": ["aluno", "professor", "coordenador", "admin"],
	"/home": ["aluno", "professor", "coordenador", "admin"],
};

/**
 * Decodifica e valida o token JWT
 */
function validateToken(token: string): TokenPayload | null {
	try {
		const decoded = jwtDecode<TokenPayload>(token);

		// Verificar se o token está expirado
		const currentTime = Math.floor(Date.now() / 1000);
		if (decoded.exp < currentTime) {
			return null;
		}

		return decoded;
	} catch (error) {
		console.error("Erro ao decodificar token:", error);
		return null;
	}
}

/**
 * Verifica se o usuário tem permissão para acessar a rota
 */
function hasRoutePermission(pathname: string, role: string): boolean {
	// Buscar a configuração de permissões para a rota
	const routeKey = Object.keys(routePermissions).find((route) =>
		pathname.startsWith(route),
	);

	if (!routeKey) {
		// Se a rota não tem restrições específicas, permitir acesso
		return true;
	}

	const allowedRoles = routePermissions[routeKey];
	return allowedRoles.includes(role);
}

export function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;
	const { pathname } = request.nextUrl;

	// Verifica se a rota atual precisa de proteção
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isPublicRoute = publicRoutes.some((route) =>
		pathname.startsWith(route),
	);

	// Se for uma rota protegida e não tiver token, redirecionar para login
	if (isProtectedRoute && !token) {
		const url = new URL("/login", request.url);
		url.searchParams.set("from", pathname);
		return NextResponse.redirect(url);
	}

	// Se for uma rota protegida, validar o token e verificar permissões
	if (isProtectedRoute && token) {
		const tokenPayload = validateToken(token);

		// Token inválido ou expirado
		if (!tokenPayload) {
			const url = new URL("/login", request.url);
			url.searchParams.set("from", pathname);
			// Limpar o cookie de token inválido
			const response = NextResponse.redirect(url);
			response.cookies.delete("token");
			return response;
		}

		// Verificar se o usuário tem permissão para acessar a rota
		if (!hasRoutePermission(pathname, tokenPayload.role)) {
			// Redirecionar para home com mensagem de acesso negado
			const url = new URL("/home", request.url);
			const response = NextResponse.redirect(url);
			// Adicionar header para indicar acesso negado
			response.headers.set("X-Access-Denied", "true");
			return response;
		}
	}

	// Se já estiver logado e tentar acessar páginas públicas como login, redirecionar para home
	if (isPublicRoute && token) {
		const tokenPayload = validateToken(token);
		// Se o token for válido, redirecionar para home
		if (tokenPayload) {
			return NextResponse.redirect(new URL("/home", request.url));
		}
	}

	return NextResponse.next();
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
	matcher: [
		// Rotas que devem ser protegidas
		"/home/:path*",
		"/disponibilidade/:path*",
		"/cadastroPaciente/:path*",
		"/cadastroUsuario/:path*",
		"/cadastroConsulta/:path*",
		// Rotas públicas (para redirecionamento se já estiver logado)
		"/login",
		"/recuperar-senha",
	],
};
