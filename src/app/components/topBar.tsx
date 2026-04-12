"use client";

import { useState } from "react";
import Link from "next/link";
import { TitleProps } from "../interfaces/types";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { useNotification } from "./Notification";
import { useAuth } from "./AuthContext";

// Itens do menu mobile com restrição por grupo
const MOBILE_MENU_ITEMS = [
	{ href: "/home", label: "Home", groups: ["GROUP_1"] as const },
	{
		href: "/disponibilidade",
		label: "Disponibilidade",
		groups: ["GROUP_2"] as const,
	},
	{
		href: "/cadastroPaciente",
		label: "Cadastro de Paciente",
		groups: ["GROUP_2"] as const,
	},
	{
		href: "/cadastroUsuario",
		label: "Cadastro de Usuário",
		groups: ["GROUP_2"] as const,
	},
	{
		href: "/cadastroConsulta",
		label: "Cadastro de Consulta",
		groups: ["GROUP_2"] as const,
	},
];

export default function TopBar(props: TitleProps) {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);

	const router = useRouter();
	const cookies = useCookies();
	const { showNotification } = useNotification();
	const { userGroup, logout } = useAuth();

	// Filtra os itens visíveis conforme o grupo do usuário
	const visibleItems = MOBILE_MENU_ITEMS.filter((item) =>
		userGroup ? item.groups.includes(userGroup as never) : false,
	);

	// Função para fazer logout
	const handleLogout = () => {
		// Limpa estado do contexto, localStorage e cookie
		logout();
		cookies.remove("token");

		// Mostrar notificação de sucesso
		showNotification("success", "Logout realizado com sucesso!");

		// Redirecionar para a página de login
		router.push("/login");
	};

	return (
		<>
			{/* TopBar Principal */}
			<div className='fixed top-0 left-0 md:left-[288px] w-full md:w-[calc(100vw-288px)] h-16 bg-blue-100 flex items-center px-4 md:px-8 shadow z-50'>
				{/* 1. Centro: Título (Perfeitamente centralizado em TODAS as telas) */}
				<div className='absolute left-1/2 transform -translate-x-1/2 text-blue-900 text-xl md:text-2xl font-bold whitespace-nowrap'>
					{props.title}
				</div>

				{/* 2. Lado Direito: Botão Hambúrguer (md:hidden faz sumir no Desktop) */}
				<div className='flex-1 flex justify-end md:hidden'>
					<button
						className='text-blue-900 p-2 hover:bg-blue-200 rounded-md transition-all'
						onClick={toggleMenu}
					>
						{isOpen ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
								className='w-8 h-8'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						) : (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
								className='w-8 h-8'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			{/* Menu Mobile - Overlay azul escuro */}
			<div
				className={`fixed left-0 w-full bg-blue-900 z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out md:hidden ${
					isOpen
						? "top-5 h-[calc(100vh-30px)] opacity-100 visible"
						: "top-0 h-0 opacity-0 invisible"
				}`}
			>
				<nav className='flex flex-col gap-8 text-center'>
					{visibleItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={toggleMenu}
							className='text-white text-2xl font-semibold hover:text-blue-300 transition-colors'
						>
							{item.label}
						</Link>
					))}
					{/* Botão de logout no final da barra */}
					<div className='w-full px-4 py-6 border-t border-blue-800 flex justify-center'>
						<button
							onClick={handleLogout}
							className='flex items-center justify-center text-gray-200 hover:bg-blue-800 rounded-lg px-6 py-3 transition-colors'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6 mr-3'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fillRule='evenodd'
									d='M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
									clipRule='evenodd'
								/>
							</svg>
							<span className='text-2xl font-semibold '>Sair</span>
						</button>
					</div>
				</nav>
			</div>
		</>
	);
}
