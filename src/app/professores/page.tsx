"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
	MagnifyingGlassIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import api from "@/app/services/api";
import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import RouteGuard from "../components/RouteGuard";
import { useNotification } from "../components/Notification";
import { Fisioterapeuta } from "../interfaces/types";

interface Perfil {
	id: number;
	nome: string;
}

export default function Professores() {
	const [professores, setProfessores] = useState<Fisioterapeuta[]>([]);
	const [termoBusca, setTermoBusca] = useState("");
	const [carregando, setCarregando] = useState(true);
	const [mostrarInativos, setMostrarInativos] = useState(false);
	const [professorParaDesativar, setProfessorParaDesativar] =
		useState<Fisioterapeuta | null>(null);

	// Paginação responsiva: page size adapta ao viewport
	const [pageSize, setPageSize] = useState(5);
	const [paginaAtual, setPaginaAtual] = useState(1);

	useEffect(() => {
		const atualizarPageSize = () => {
			const w = window.innerWidth;
			if (w < 640) setPageSize(3); // mobile
			else if (w < 1024) setPageSize(5); // tablet
			else setPageSize(8); // desktop
		};
		atualizarPageSize();
		window.addEventListener("resize", atualizarPageSize);
		return () => window.removeEventListener("resize", atualizarPageSize);
	}, []);

	useEffect(() => {
		setPaginaAtual(1);
	}, [termoBusca, pageSize]);

	const { showNotification } = useNotification();

	useEffect(() => {
		// Busca os perfis para descobrir o id do perfil "professor" sem hardcode,
		// e em paralelo busca todos os usuários para filtrar pelo perfil correto.
		Promise.all([api.get<Perfil[]>("/perfil"), api.get<Fisioterapeuta[]>("/usuario")])
			.then(([resPerfis, resUsuarios]) => {
				const perfilProfessor = resPerfis.data.find(
					(p) => p.nome.toLowerCase() === "professor",
				);
				if (!perfilProfessor) {
					setProfessores([]);
					return;
				}
				const apenasProfessores = resUsuarios.data.filter(
					(u) => u.perfil_id === perfilProfessor.id,
				);
				setProfessores(apenasProfessores);
			})
			.catch((err) => {
				console.error("Erro ao carregar professores:", err);
				showNotification(
					"error",
					"Não foi possível carregar a lista de professores.",
				);
			})
			.finally(() => setCarregando(false));
	}, [showNotification]);

	// Considera ativo qualquer valor diferente de 0 (inclui undefined, para
	// compatibilidade com a fase em que a coluna `ativo` ainda não existe no banco).
	const isAtivo = (u: Fisioterapeuta) => u.ativo !== 0;

	const professoresAtivos = useMemo(
		() => professores.filter(isAtivo),
		[professores],
	);
	const professoresInativos = useMemo(
		() => professores.filter((u) => !isAtivo(u)),
		[professores],
	);

	// Filtragem em tempo real, client-side, case-insensitive (somente sobre ativos)
	const professoresFiltrados = useMemo(() => {
		const termo = termoBusca.trim().toLowerCase();
		if (!termo) return professoresAtivos;
		return professoresAtivos.filter((p) =>
			p.nome_completo.toLowerCase().includes(termo),
		);
	}, [professoresAtivos, termoBusca]);

	// Recorta a página atual a exibir
	const totalPaginas = Math.max(
		1,
		Math.ceil(professoresFiltrados.length / pageSize),
	);
	const paginaCorrigida = Math.min(paginaAtual, totalPaginas);
	const professoresPaginados = professoresFiltrados.slice(
		(paginaCorrigida - 1) * pageSize,
		paginaCorrigida * pageSize,
	);
	const inicioFaixa =
		professoresFiltrados.length === 0
			? 0
			: (paginaCorrigida - 1) * pageSize + 1;
	const fimFaixa = Math.min(
		paginaCorrigida * pageSize,
		professoresFiltrados.length,
	);

	const atualizarStatusLocal = (id: number, ativo: number) => {
		setProfessores((prev) =>
			prev.map((u) => (u.id === id ? { ...u, ativo } : u)),
		);
	};

	const confirmarDesativacao = async () => {
		if (!professorParaDesativar?.id) return;
		try {
			await api.put(`/usuario/${professorParaDesativar.id}`, { ativo: 0 });
			atualizarStatusLocal(professorParaDesativar.id, 0);
			showNotification(
				"success",
				`${professorParaDesativar.nome_completo} foi desativado(a).`,
			);
		} catch (err) {
			console.error("Erro ao desativar professor:", err);
			showNotification(
				"error",
				"Erro ao desativar o professor. Tente novamente.",
			);
		} finally {
			setProfessorParaDesativar(null);
		}
	};

	const reativar = async (professor: Fisioterapeuta) => {
		if (!professor.id) return;
		try {
			await api.put(`/usuario/${professor.id}`, { ativo: 1 });
			atualizarStatusLocal(professor.id, 1);
			showNotification(
				"success",
				`${professor.nome_completo} foi reativado(a).`,
			);
		} catch (err) {
			console.error("Erro ao reativar professor:", err);
			showNotification(
				"error",
				"Erro ao reativar o professor. Tente novamente.",
			);
		}
	};

	return (
		<RouteGuard>
			<NavBar />
			<TopBar title='Professores' />

			<main className='flex flex-col min-h-screen p-0'>
				<div className='w-full px-4 mt-20 md:ml-[288px] md:w-[calc(100vw-320px)] md:px-8'>
					{/* Campo de busca */}
					<div className='mb-6'>
						<label htmlFor='busca-professor' className='sr-only'>
							Pesquisar professor pelo nome
						</label>
						<div className='relative'>
							<div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
								<MagnifyingGlassIcon
									className='h-5 w-5 text-gray-400'
									aria-hidden='true'
								/>
							</div>
							<input
								id='busca-professor'
								type='text'
								value={termoBusca}
								onChange={(e) => setTermoBusca(e.target.value)}
								placeholder='Pesquisar professor pelo nome...'
								className='block w-full rounded-lg border border-gray-300 bg-white py-2.5 !pl-10 !pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900'
							/>
						</div>
					</div>

					{/* Tabela (desktop) */}
					<div className='hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600'>
										Nome
									</th>
									<th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600'>
										E-mail
									</th>
									<th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600'>
										Telefone
									</th>
									<th className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600'>
										Ações
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100 bg-white'>
								{carregando ? (
									<tr>
										<td
											colSpan={4}
											className='px-6 py-10 text-center text-sm text-gray-500'
										>
											Carregando professores...
										</td>
									</tr>
								) : professoresFiltrados.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className='px-6 py-10 text-center text-sm text-gray-500'
										>
											Nenhum professor encontrado.
										</td>
									</tr>
								) : (
									professoresPaginados.map((professor) => (
										<tr
											key={professor.email}
											className='transition-colors hover:bg-blue-50'
										>
											<td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
												{professor.nome_completo}
											</td>
											<td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
												{professor.email}
											</td>
											<td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
												{professor.telefone || "—"}
											</td>
											<td className='whitespace-nowrap px-6 py-4 text-right text-sm'>
												<button
													type='button'
													onClick={() => setProfessorParaDesativar(professor)}
													className='inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-100'
												>
													Desativar
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Cards (mobile) */}
					<div className='md:hidden space-y-3'>
						{carregando ? (
							<p className='rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-sm'>
								Carregando professores...
							</p>
						) : professoresFiltrados.length === 0 ? (
							<p className='rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-sm'>
								Nenhum professor encontrado.
							</p>
						) : (
							professoresPaginados.map((professor) => (
								<div
									key={professor.email}
									className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-blue-50'
								>
									<p className='text-base font-semibold text-gray-900'>
										{professor.nome_completo}
									</p>
									<p className='mt-1 text-sm text-gray-600 break-all'>
										{professor.email}
									</p>
									<p className='mt-1 text-sm text-gray-500'>
										Telefone: {professor.telefone || "—"}
									</p>
									<div className='mt-3'>
										<button
											type='button'
											onClick={() => setProfessorParaDesativar(professor)}
											className='inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100'
										>
											Desativar
										</button>
									</div>
								</div>
							))
						)}
					</div>

					{/* Controles de paginação */}
					{!carregando && professoresFiltrados.length > 0 && (
						<div className='mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row'>
							<p className='text-xs text-gray-500'>
								Exibindo {inicioFaixa}-{fimFaixa} de{" "}
								{professoresFiltrados.length}
							</p>
							<div className='flex items-center gap-2'>
								<button
									type='button'
									onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
									disabled={paginaCorrigida === 1}
									className='rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
								>
									Anterior
								</button>
								<span className='text-xs text-gray-600'>
									Página {paginaCorrigida} de {totalPaginas}
								</span>
								<button
									type='button'
									onClick={() =>
										setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
									}
									disabled={paginaCorrigida === totalPaginas}
									className='rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
								>
									Próxima
								</button>
							</div>
						</div>
					)}

					{/* Toggle do container de inativos */}
					<div className='mt-8 flex items-center justify-between'>
						<h2 className='text-lg font-semibold text-gray-800'>
							Professores inativos
							<span className='ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700'>
								{professoresInativos.length}
							</span>
						</h2>
						<button
							type='button'
							onClick={() => setMostrarInativos((v) => !v)}
							className='inline-flex items-center rounded-md bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-800'
						>
							{mostrarInativos ? "Ocultar inativos" : "Mostrar inativos"}
						</button>
					</div>

					{/* Container dos inativos */}
					{mostrarInativos && (
						<section className='mt-3 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm'>
							{professoresInativos.length === 0 ? (
								<p className='py-6 text-center text-sm text-gray-500'>
									Nenhum professor inativo no momento.
								</p>
							) : (
								<ul className='divide-y divide-gray-200'>
									{professoresInativos.map((professor) => (
										<li
											key={professor.email}
											className='flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between'
										>
											<div>
												<p className='text-sm font-medium text-gray-900'>
													{professor.nome_completo}
												</p>
												<p className='text-xs text-gray-500 break-all'>
													{professor.email}
												</p>
											</div>
											<button
												type='button'
												onClick={() => reativar(professor)}
												className='inline-flex items-center self-start rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 sm:self-auto'
											>
												Reativar
											</button>
										</li>
									))}
								</ul>
							)}
						</section>
					)}
				</div>
			</main>

			{/* Modal de confirmação de desativação */}
			<Transition.Root show={professorParaDesativar !== null} as={Fragment}>
				<Dialog
					as='div'
					className='relative z-10'
					onClose={() => setProfessorParaDesativar(null)}
				>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<div className='fixed inset-0 backdrop-blur-xs transition-opacity' />
					</Transition.Child>

					<div className='fixed inset-0 z-10 overflow-y-auto'>
						<div className='flex min-h-full items-center justify-center p-4'>
							<Transition.Child
								as={Fragment}
								enter='ease-out duration-300'
								enterFrom='opacity-0 translate-y-4 sm:scale-95'
								enterTo='opacity-100 translate-y-0 sm:scale-100'
								leave='ease-in duration-200'
								leaveFrom='opacity-100 translate-y-0 sm:scale-100'
								leaveTo='opacity-0 translate-y-4 sm:scale-95'
							>
								<Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
									<div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
										<div className='sm:flex sm:items-start'>
											<div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
												<ExclamationTriangleIcon
													className='h-6 w-6 text-red-600'
													aria-hidden='true'
												/>
											</div>
											<div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
												<Dialog.Title
													as='h3'
													className='text-base font-semibold leading-6 text-gray-900'
												>
													Desativar professor
												</Dialog.Title>
												<div className='mt-2'>
													<p className='text-sm text-gray-500'>
														Deseja realmente desativar{" "}
														<strong>
															{professorParaDesativar?.nome_completo}
														</strong>
														? O professor deixará de aparecer nas pesquisas, mas
														poderá ser reativado depois.
													</p>
												</div>
											</div>
										</div>
									</div>
									<div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
										<button
											type='button'
											onClick={confirmarDesativacao}
											className='inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto'
										>
											Desativar
										</button>
										<button
											type='button'
											onClick={() => setProfessorParaDesativar(null)}
											className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
										>
											Cancelar
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</RouteGuard>
	);
}
