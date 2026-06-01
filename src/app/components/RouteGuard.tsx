"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { canAccessRoute, getDefaultRoute } from "../lib/permissions";

interface RouteGuardProps {
  children: ReactNode;
}

// ─── RouteGuard ────────────────────────────────────────────────────────────────────
// Protege rotas verificando autenticação e permissões por grupo de perfil.
// Redireciona para rota padrão do grupo quando o usuário tenta acessar algo proibido.
export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, userGroup, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Aguarda o carregamento inicial do usuário
    if (isLoading) return;

    // 1. Não autenticado → login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // 2. Autenticado mas sem grupo válido → logout + login
    if (!userGroup) {
      router.replace("/login");
      return;
    }

    // 3. Verifica se o grupo pode acessar a rota atual
    if (!canAccessRoute(userGroup, pathname, user?.perfil)) {
      router.replace(getDefaultRoute(userGroup));
      return;
    }
  }, [isAuthenticated, isLoading, userGroup, user?.perfil, pathname, router]);

  // Enquanto carrega ou redireciona, mostra um loader
  if (isLoading || !isAuthenticated || !userGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-900 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o grupo não pode acessar a rota, bloqueia renderização enquanto redireciona
  if (!canAccessRoute(userGroup, pathname, user?.perfil)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-900 font-medium">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
