# Exemplos de Uso do Sistema RBAC

Este documento fornece exemplos práticos de como usar o sistema de permissões implementado.

---

## 📌 Exemplo 1: Verificar Permissões em um Componente

```tsx
"use client";

import { usePermissions } from "../hooks/usePermissions";
import Button from "../components/button";

export default function MeuComponente() {
	const { checkCanUpdate, isAluno, hasFullAccess, userRole } = usePermissions();

	const canEditPatient = checkCanUpdate("paciente");

	return (
		<div>
			{/* Exibir informações do usuário */}
			<p>Seu perfil: {userRole}</p>

			{/* Mostrar conteúdo condicional baseado no role */}
			{isAluno() && (
				<div className='alert alert-info'>
					Você é um aluno. Seu acesso é limitado apenas à leitura.
				</div>
			)}

			{/* Habilitar/desabilitar botão baseado em permissão */}
			<Button
				text='Editar Paciente'
				onClick={handleEdit}
				disabled={!canEditPatient}
			/>

			{/* Mostrar seção apenas para usuários com acesso completo */}
			{hasFullAccess() && (
				<section>
					<h2>Área Administrativa</h2>
					<p>
						Esta seção é visível apenas para professores, coordenadores e
						administradores.
					</p>
				</section>
			)}
		</div>
	);
}
```

---

## 📌 Exemplo 2: Usar Funções de Auth Diretamente

```tsx
"use client";

import {
	getUserRole,
	hasPermission,
	getUserInfo,
	canUpdate,
} from "../utils/auth";
import { useEffect, useState } from "react";

export default function PerfilUsuario() {
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		// Obter informações do usuário
		const userInfo = getUserInfo();
		setUserData(userInfo);

		// Verificar role
		const role = getUserRole();
		console.log("Role do usuário:", role);

		// Verificar permissão específica
		if (hasPermission("paciente", "update", "any")) {
			console.log("Usuário pode atualizar pacientes");
		}

		// Verificar se pode atualizar
		if (canUpdate("consulta")) {
			console.log("Usuário pode criar/atualizar consultas");
		}
	}, []);

	return (
		<div>
			{userData && (
				<div>
					<h2>Informações do Usuário</h2>
					<p>Email: {userData.email}</p>
					<p>Role: {userData.role}</p>
					<p>ID: {userData.id}</p>
				</div>
			)}
		</div>
	);
}
```

---

## 📌 Exemplo 3: Criar Componente de Botão Protegido

```tsx
"use client";

import { usePermissions } from "../hooks/usePermissions";
import Button from "../components/button";

interface ProtectedButtonProps {
	resource: string;
	text: string;
	onClick: () => void;
	variant?: "primary" | "secondary";
}

export function ProtectedButton({
	resource,
	text,
	onClick,
	variant = "primary",
}: ProtectedButtonProps) {
	const { checkCanUpdate } = usePermissions();
	const hasPermission = checkCanUpdate(resource);

	if (!hasPermission) {
		return null; // Não renderizar o botão se não tiver permissão
	}

	return <Button text={text} onClick={onClick} variant={variant} />;
}

// Uso:
// <ProtectedButton
//   resource="paciente"
//   text="Cadastrar Paciente"
//   onClick={handleCadastrar}
// />
```

---

## 📌 Exemplo 4: Criar Guard de Rota Customizado

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, hasPermission } from "../utils/auth";

interface RoleGuardProps {
	children: React.ReactNode;
	requiredRole?: string[];
	resource?: string;
	action?: string;
	fallbackUrl?: string;
}

export function RoleGuard({
	children,
	requiredRole,
	resource,
	action = "read",
	fallbackUrl = "/home",
}: RoleGuardProps) {
	const router = useRouter();

	useEffect(() => {
		// Verificar autenticação
		if (!isAuthenticated()) {
			router.push("/login");
			return;
		}

		// Verificar permissão se resource for especificado
		if (resource && !hasPermission(resource, action, "any")) {
			router.push(fallbackUrl);
			return;
		}

		// Verificar role específico se requiredRole for especificado
		if (requiredRole) {
			const userRole = getUserRole();
			if (!requiredRole.includes(userRole || "")) {
				router.push(fallbackUrl);
			}
		}
	}, [router, requiredRole, resource, action, fallbackUrl]);

	return <>{children}</>;
}

// Uso:
// <RoleGuard requiredRole={['professor', 'admin']}>
//   <ConteudoProtegido />
// </RoleGuard>
```

---

## 📌 Exemplo 5: Exibir Conteúdo Condicional Baseado em Permissões

```tsx
"use client";

import { usePermissions } from "../hooks/usePermissions";

export default function Dashboard() {
	const {
		isAluno,
		isProfessor,
		isCoordenador,
		isAdmin,
		checkCanUpdate,
		checkCanDelete,
	} = usePermissions();

	return (
		<div className='dashboard'>
			<h1>Dashboard</h1>

			{/* Conteúdo para todos os usuários */}
			<section>
				<h2>Consultas Agendadas</h2>
				{/* Lista de consultas */}
			</section>

			{/* Conteúdo apenas para alunos */}
			{isAluno() && (
				<section>
					<h2>Minhas Consultas</h2>
					<p>Você pode visualizar apenas suas próprias consultas.</p>
				</section>
			)}

			{/* Conteúdo para professor, coordenador e admin */}
			{(isProfessor() || isCoordenador() || isAdmin()) && (
				<section>
					<h2>Gestão de Pacientes</h2>

					{checkCanUpdate("paciente") && (
						<button>Cadastrar Novo Paciente</button>
					)}

					{checkCanDelete("paciente") && <button>Gerenciar Pacientes</button>}
				</section>
			)}

			{/* Conteúdo exclusivo para admin */}
			{isAdmin() && (
				<section>
					<h2>Administração do Sistema</h2>
					<p>Acesso completo a todas as funcionalidades administrativas.</p>
				</section>
			)}
		</div>
	);
}
```

---

## 📌 Exemplo 6: Tratamento de Erros de Permissão

```tsx
"use client";

import { useState } from "react";
import api from "../services/api";
import { useNotification } from "../components/Notification";
import { canUpdate } from "../utils/auth";

export default function CadastroForm() {
	const [loading, setLoading] = useState(false);
	const { showNotification } = useNotification();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Verificar permissão antes de enviar
		if (!canUpdate("paciente")) {
			showNotification(
				"error",
				"Você não tem permissão para realizar esta ação.",
			);
			return;
		}

		setLoading(true);

		try {
			await api.post("/paciente", formData);
			showNotification("success", "Paciente cadastrado com sucesso!");
		} catch (error) {
			if (error.response?.status === 403) {
				showNotification(
					"error",
					"Acesso negado: Você não tem permissão para cadastrar pacientes.",
				);
			} else if (error.response?.status === 401) {
				showNotification(
					"error",
					"Sua sessão expirou. Por favor, faça login novamente.",
				);
			} else {
				showNotification(
					"error",
					"Erro ao cadastrar paciente. Tente novamente.",
				);
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			{/* Campos do formulário */}
			<button type='submit' disabled={loading || !canUpdate("paciente")}>
				{loading ? "Salvando..." : "Salvar"}
			</button>
		</form>
	);
}
```

---

## 📌 Exemplo 7: Logout Seguro

```tsx
"use client";

import { logout } from "../utils/auth";

export default function LogoutButton() {
	function handleLogout() {
		// Confirmar antes de sair
		if (confirm("Deseja realmente sair do sistema?")) {
			// A função logout já limpa o token e localStorage
			// e redireciona para /login automaticamente
			logout();
		}
	}

	return (
		<button onClick={handleLogout} className='btn-logout'>
			Sair
		</button>
	);
}
```

---

## 📌 Exemplo 8: Hook Customizado para Verificar Acesso a Rota

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "../utils/auth";

/**
 * Hook para verificar se o usuário tem acesso à rota atual
 */
export function useRouteAccess(allowedRoles: string[]) {
	const router = useRouter();
	const [hasAccess, setHasAccess] = useState(false);
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// Verificar autenticação
		if (!isAuthenticated()) {
			router.push("/login");
			return;
		}

		// Verificar role
		const userRole = getUserRole();
		if (userRole && allowedRoles.includes(userRole)) {
			setHasAccess(true);
		} else {
			setHasAccess(false);
			router.push("/home");
		}

		setIsChecking(false);
	}, [router, allowedRoles]);

	return { hasAccess, isChecking };
}

// Uso em uma página:
export default function PaginaAdministracao() {
	const { hasAccess, isChecking } = useRouteAccess(["admin", "coordenador"]);

	if (isChecking) {
		return <div>Verificando permissões...</div>;
	}

	if (!hasAccess) {
		return null; // Ou um componente de loading
	}

	return (
		<div>
			<h1>Página de Administração</h1>
			{/* Conteúdo protegido */}
		</div>
	);
}
```

---

## 📌 Exemplo 9: Componente de Lista com Ações Condicionais

```tsx
"use client";

import { usePermissions } from "../hooks/usePermissions";

interface Paciente {
	id: number;
	nome_completo: string;
	cpf: string;
}

interface Props {
	pacientes: Paciente[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

export default function ListaPacientes({ pacientes, onEdit, onDelete }: Props) {
	const { checkCanUpdate, checkCanDelete } = usePermissions();

	const canEdit = checkCanUpdate("paciente");
	const canRemove = checkCanDelete("paciente");

	return (
		<table>
			<thead>
				<tr>
					<th>Nome</th>
					<th>CPF</th>
					{(canEdit || canRemove) && <th>Ações</th>}
				</tr>
			</thead>
			<tbody>
				{pacientes.map((paciente) => (
					<tr key={paciente.id}>
						<td>{paciente.nome_completo}</td>
						<td>{paciente.cpf}</td>
						{(canEdit || canRemove) && (
							<td>
								{canEdit && (
									<button onClick={() => onEdit(paciente.id)}>Editar</button>
								)}
								{canRemove && (
									<button onClick={() => onDelete(paciente.id)}>Excluir</button>
								)}
							</td>
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
}
```

---

## 🔍 Dicas de Uso

### 1. Sempre Verificar Permissões no Frontend e Backend

O frontend valida para melhorar UX, mas o backend sempre valida por segurança.

### 2. Usar Hook usePermissions em Componentes

Mais fácil e reativo que usar funções diretas.

### 3. Desabilitar vs Esconder

- **Desabilitar:** Botões que o usuário pode ver mas não usar (melhor UX)
- **Esconder:** Conteúdo sensível que não deve ser visto

### 4. Feedback Visual

Sempre mostre mensagens claras quando uma ação não é permitida.

### 5. Cache de Permissões

As permissões são lidas do token, então são muito rápidas. Não precisa cache adicional.

---

## ⚠️ Avisos Importantes

1. **Nunca confie apenas no frontend** - O backend sempre deve validar permissões
2. **Token expira em 1 hora** - Implemente refresh token ou peça novo login
3. **Roles são case-sensitive** - Use sempre lowercase ('aluno', não 'Aluno')
4. **Verificar isAuthenticated()** - Antes de qualquer verificação de permissão
5. **Limpar dados sensíveis** - Ao fazer logout, limpar todo o localStorage

---

**Última Atualização:** 08/10/2025
