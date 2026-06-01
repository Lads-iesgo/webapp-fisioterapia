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
	aluno_id?: number;
	status?: string;
}

export interface Evento {
	id?: number;
	title: number | string;
	start: string | Date;
	paciente_id?: number;
	horario_id?: number;
	aluno_id?: number;
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
	ativo?: number;
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
	// 1 = ativo, 0 = inativo. Opcional enquanto a coluna ainda não existe no banco.
	ativo?: number;
}

export interface Indisponibilidade {
	id?: number;
	data_indisponivel: string;
	descricao?: string;
	hora_inicio?: string | null;
	hora_fim?: string | null;
}
