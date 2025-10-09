export interface TitleProps {
	title: string;
}

export interface Horario {
	id?: number;
	horario: string;
}

export interface Consulta {
	id?: number | string;
	paciente_id: number | string;
	data_consulta: Date | string;
	horario_id?: number;
	fisioterapeuta_id?: number;
	status?: string;
}

export interface Evento {
	id?: number;
	title: number | string;
	start: string | Date;
	paciente_id?: number;
	horario_id?: number;
	fisioterapeuta_id?: number;
	status?: string;
}

export interface Paciente {
	id?: number;
	nome_completo: string;
	email: string;
	telefone: string;
	genero: string;
	data_nascimento: Date;
	cpf: string;
	cep: string;
	endereco: string;
}

export interface Fisioterapeuta {
	id?: number;
	nome_completo: string;
	email: string;
	senha_hash?: string;
	senha?: string;
	telefone: string;
	cpf: string;
	semestre: string;
	perfil_id: number;
}

// Interfaces para autenticação RBAC
export interface TokenPayload {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	iat: number;
	exp: number;
}

export interface UserInfo {
	id: number;
	email: string;
	role: string;
	perfil_id: number;
	nome?: string;
	perfil?: string;
}

export interface LoginResponse {
	status: string;
	token: string;
	user: {
		id: number;
		email: string;
		nome: string;
		perfil: string;
		role?: string;
		perfil_id: number;
	};
}

// Tipos de roles disponíveis
export type UserRole = "aluno" | "professor" | "coordenador" | "admin";

// Tipos de permissões
export type Permission = "read" | "update" | "delete";
export type PermissionScope = "any" | "own";
