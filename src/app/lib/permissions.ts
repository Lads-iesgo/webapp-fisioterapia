// ─── Configuração centralizada de permissões e rotas ───────────────────────────────

// Nomes dos perfis (devem corresponder exatamente ao campo perfil.nome no banco)
export const ROLES = {
  ADMIN: "admin",
  ALUNO: "aluno",
  COORDENADOR: "coordenador",
  FISIOTERAPEUTA: "fisioterapeuta",
  PROFESSOR: "professor",
} as const;

export type UserRole =
  | "admin"
  | "aluno"
  | "coordenador"
  | "fisioterapeuta"
  | "professor";

// Grupos de perfis com permissões equivalentes
export const ROLE_GROUPS = {
  // Grupo 1: Aluno e Fisioterapeuta — somente acesso à Home
  GROUP_1: [ROLES.ALUNO, ROLES.FISIOTERAPEUTA] as UserRole[],
  // Grupo 2: Professor, Coordenador e Admin — acesso a tudo exceto Home
  GROUP_2: [ROLES.PROFESSOR, ROLES.COORDENADOR, ROLES.ADMIN] as UserRole[],
};

// Rotas públicas (acessíveis sem autenticação)
export const PUBLIC_ROUTES = ["/login", "/recuperar-senha", "/"];

// Rotas permitidas para cada grupo
export const ALLOWED_ROUTES: Record<"GROUP_1" | "GROUP_2", string[]> = {
  GROUP_1: ["/home"],
  GROUP_2: [
    "/disponibilidade",
    "/cadastroPaciente",
    "/cadastroUsuario",
    "/cadastroConsulta",
  ],
};

// Rotas de redirecionamento padrão (fallback) por grupo
export const DEFAULT_ROUTE: Record<"GROUP_1" | "GROUP_2", string> = {
  GROUP_1: "/home",
  GROUP_2: "/disponibilidade",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────────

// Retorna a qual grupo um perfil pertence
export function getUserGroup(role: string | null | undefined): "GROUP_1" | "GROUP_2" | null {
  if (!role) return null;
  const normalized = role.toLowerCase() as UserRole;

  if (ROLE_GROUPS.GROUP_1.includes(normalized)) return "GROUP_1";
  if (ROLE_GROUPS.GROUP_2.includes(normalized)) return "GROUP_2";
  return null;
}

// Verifica se um grupo pode acessar determinada rota
export function canAccessRoute(
  group: "GROUP_1" | "GROUP_2" | null,
  pathname: string
): boolean {
  if (!group) return false;
  // Verifica se a rota começa com alguma das rotas permitidas
  return ALLOWED_ROUTES[group].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Retorna a rota padrão de redirecionamento para um grupo
export function getDefaultRoute(group: "GROUP_1" | "GROUP_2" | null): string {
  if (!group) return "/login";
  return DEFAULT_ROUTE[group];
}
