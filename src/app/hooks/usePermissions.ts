"use client";

import { useState, useEffect } from "react";
import {
	getUserRole,
	hasPermission,
	canUpdate,
	canDelete,
	canRead,
	getUserInfo,
} from "../utils/auth";
import type { UserRole } from "../interfaces/types";

/**
 * Hook customizado para gerenciar permissões do usuário
 */
export function usePermissions() {
	const [userRole, setUserRole] = useState<UserRole | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Obter role do usuário ao montar o componente
		const role = getUserRole();
		setUserRole(role as UserRole);
		setIsLoading(false);
	}, []);

	/**
	 * Verifica se o usuário tem permissão para uma ação específica
	 */
	const checkPermission = (
		resource: string,
		action: string,
		scope: "any" | "own" = "any",
	): boolean => {
		return hasPermission(resource, action, scope);
	};

	/**
	 * Verifica se o usuário pode atualizar um recurso
	 */
	const checkCanUpdate = (resource: string): boolean => {
		return canUpdate(resource);
	};

	/**
	 * Verifica se o usuário pode deletar um recurso
	 */
	const checkCanDelete = (resource: string): boolean => {
		return canDelete(resource);
	};

	/**
	 * Verifica se o usuário pode ler um recurso
	 */
	const checkCanRead = (resource: string): boolean => {
		return canRead(resource);
	};

	/**
	 * Verifica se o usuário é aluno
	 */
	const isAluno = (): boolean => {
		return userRole === "aluno";
	};

	/**
	 * Verifica se o usuário é professor
	 */
	const isProfessor = (): boolean => {
		return userRole === "professor";
	};

	/**
	 * Verifica se o usuário é coordenador
	 */
	const isCoordenador = (): boolean => {
		return userRole === "coordenador";
	};

	/**
	 * Verifica se o usuário é admin
	 */
	const isAdmin = (): boolean => {
		return userRole === "admin";
	};

	/**
	 * Verifica se o usuário tem acesso completo (professor, coordenador ou admin)
	 */
	const hasFullAccess = (): boolean => {
		return ["professor", "coordenador", "admin"].includes(userRole || "");
	};

	/**
	 * Obtém informações do usuário
	 */
	const getUser = () => {
		return getUserInfo();
	};

	return {
		userRole,
		isLoading,
		checkPermission,
		checkCanUpdate,
		checkCanDelete,
		checkCanRead,
		isAluno,
		isProfessor,
		isCoordenador,
		isAdmin,
		hasFullAccess,
		getUser,
	};
}
