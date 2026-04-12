import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/home', '/disponibilidade', '/cadastroPaciente', '/cadastroUsuario', '/cadastroConsulta'];
// Rotas públicas (não requerem autenticação)
const publicRoutes = ['/login', '/recuperar-senha'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Verifica se a rota atual precisa de proteção
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Se for uma rota protegida e não tiver token, redirecionar para login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Se já estiver logado e tentar acessar páginas públicas como login, redirecionar para home
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
  matcher: [
    // Rotas que devem ser protegidas
    '/home/:path*', 
    '/disponibilidade/:path*',
    '/cadastroPaciente/:path*',
    '/cadastroUsuario/:path*',
    '/cadastroConsulta/:path*',
    // Rotas públicas (para redirecionamento se já estiver logado)
    '/login',
    '/recuperar-senha'
  ]
};