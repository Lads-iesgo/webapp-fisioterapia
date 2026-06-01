"use client";

//Importações necessárias
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { useNotification } from "./Notification";
import { useAuth } from "./AuthContext";
import { getVisibleMenuItems } from "../lib/menuItems";

//Componente NavBar que representa a barra de navegação lateral
export default function NavBar() {
	const router = useRouter();
	const cookies = useCookies();
	const { showNotification } = useNotification();
	const { userGroup, user, logout } = useAuth();

	const visibleItems = getVisibleMenuItems(userGroup, user?.perfil);

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
		<div className='hidden md:flex bg-blue-900 fixed left-0 top-0 w-72 h-screen overflow-y-auto z-10'>
			<div className='flex flex-col h-full w-full'>
				{/* Logo e título no topo */}
				<div className='flex flex-col items-center py-8'>
					<Image
						src='/logo-iesgo.png'
						width={120}
						height={45}
						alt='Logo IESGO'
						className='mb-2 h-auto'
					/>
					<h2 className='text-white text-xl font-semibold tracking-wide'>
						FISIOTERAPIA
					</h2>
				</div>

				{/* Links de navegação (renderizados condicionalmente pelo grupo) */}
				<nav className='flex-1 px-4 py-4'>
					<ul className='space-y-2'>
						{visibleItems.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className='flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
								>
									<span className='text-lg'>{item.label}</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>

				{/* Botão de logout no final da barra */}
				<div className='px-4 py-6 border-t border-blue-800'>
					<button
						onClick={handleLogout}
						className='flex items-center w-full text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5 mr-3'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
							<polyline points='16 17 21 12 16 7' />
							<line x1='21' y1='12' x2='9' y2='12' />
						</svg>
						<span className='text-lg font-medium'>Sair</span>
					</button>
				</div>
			</div>
		</div>
	);
}
