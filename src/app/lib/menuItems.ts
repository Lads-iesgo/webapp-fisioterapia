import { UserRole } from "./permissions";

export type MenuItem = {
	href: string;
	label: string;
	groups: readonly ("GROUP_1" | "GROUP_2")[];
	// Restrição opcional por role — quando presente, o usuário precisa ter um
	// dos roles listados, mesmo pertencendo ao grupo permitido.
	roles?: readonly UserRole[];
};

// Fonte única dos itens de navegação. NavBar (desktop) e TopBar (mobile) leem daqui.
export const MENU_ITEMS: MenuItem[] = [
	{ href: "/home", label: "Home", groups: ["GROUP_1"] },
	{ href: "/disponibilidade", label: "Disponibilidade", groups: ["GROUP_2"] },
	{
		href: "/cadastroPaciente",
		label: "Cadastro de Paciente",
		groups: ["GROUP_2"],
	},
	{
		href: "/cadastroUsuario",
		label: "Cadastro de Usuário",
		groups: ["GROUP_2"],
	},
	{ href: "/alunos", label: "Alunos", groups: ["GROUP_2"] },
	{ href: "/pacientes", label: "Pacientes", groups: ["GROUP_2"] },
	{
		href: "/professores",
		label: "Professores",
		groups: ["GROUP_2"],
		roles: ["admin", "coordenador"],
	},
];

// Filtra itens visíveis com base no grupo e no role do usuário logado
export function getVisibleMenuItems(
	userGroup: "GROUP_1" | "GROUP_2" | null,
	role: UserRole | null | undefined,
): MenuItem[] {
	return MENU_ITEMS.filter((item) => {
		if (!userGroup || !item.groups.includes(userGroup)) return false;
		if (item.roles && (!role || !item.roles.includes(role))) return false;
		return true;
	});
}
