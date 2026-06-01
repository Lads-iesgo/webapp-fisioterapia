"use client";

//Importando a API
import api from "@/app/services/api";

//Importações necessárias
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/pt-br";
import { EventInput, EventClickArg } from "@fullcalendar/core";

import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition, Select } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import RouteGuard from "../components/RouteGuard";

//Importação das tipagens necessárias
import {
	Consulta,
	Evento,
	Paciente,
	Fisioterapeuta,
	Indisponibilidade,
	Horario,
} from "../interfaces/types";

export default function Disponibilidade() {
	const [indisponibilidades, setIndisponibilidades] = useState<
		Indisponibilidade[]
	>([]);
	const [userPerfil, setUserPerfil] = useState<string>("");
	//Definindo os estados para armazenar os dados
	const [consulta, setConsulta] = useState<Consulta[]>([]);
	const [events, setEvents] = useState<EventInput[]>([]);
	const [newEvent, setNewEvent] = useState<Evento>({
		title: "",
		start: "",
	});
	const [showModal, setShowModal] = useState(false);
	const [showActionModal, setShowActionModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<{
		id: number | null;
		pacienteNome?: string;
		alunoNome?: string;
		horario?: string;
	} | null>(null);

	const [pacientes, setPacientes] = useState<Paciente[]>([]);
	const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
	const [horarios, setHorarios] = useState<Horario[]>([]);
	const [notification, setNotification] = useState<{
		type: "success" | "error" | "warning";
		message: string;
		show: boolean;
	}>({
		type: "success",
		message: "",
		show: false,
	});

	const [actionModalMode, setActionModalMode] = useState<
		"default" | "unavailable"
	>("default");
	const [selectedUnavailableEventId, setSelectedUnavailableEventId] = useState<
		string | null
	>(null);

	// Filtros da listagem: "all" representa "Todos"
	const [filtroAlunoId, setFiltroAlunoId] = useState<string>("all");
	const [filtroPacienteId, setFiltroPacienteId] = useState<string>("all");

	// Referência ao FullCalendar para mudar a visualização programaticamente
	const calendarRef = useRef<FullCalendar | null>(null);

	// Input nativo de data (escondido) — disparado ao clicar no título do calendário
	const dateInputRef = useRef<HTMLInputElement | null>(null);

	// Aplica a escolha do usuário: muda para a visão diária no dia selecionado
	function irParaDia(dataStr: string) {
		if (!dataStr) return;
		const api = calendarRef.current?.getApi();
		if (!api) return;
		// Usa horário local para evitar deslocamento de fuso ao parsear "YYYY-MM-DD"
		const [ano, mes, dia] = dataStr.split("-").map(Number);
		api.changeView("timeGridDay", new Date(ano, mes - 1, dia));
	}

	// Torna o título do FullCalendar (ex: "Abril 2026") clicável para abrir
	// o seletor de data nativo. Reaplica a cada mudança de visualização porque
	// o FullCalendar recria/atualiza o elemento do título.
	function tornarTituloClicavel() {
		const titleEl = document.querySelector(".fc-toolbar-title") as
			| (HTMLElement & {
					_dayPickerHandler?: () => void;
					_dayPickerEnter?: () => void;
					_dayPickerLeave?: () => void;
			  })
			| null;
		if (!titleEl) return;

		// Lê o título direto da API do FullCalendar (fonte canônica) em vez do
		// DOM — evita duplicação se o FC mutou o título antes do nosso callback.
		const tituloTexto =
			calendarRef.current?.getApi().view.title ||
			(titleEl.textContent || "").trim();
		titleEl.innerHTML =
			`<span>${tituloTexto}</span>` +
			`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:0.5rem;display:inline-block;vertical-align:middle"><polyline points="6 9 12 15 18 9"/></svg>`;

		// Aparência de botão: padding, borda inferior tracejada, hover com fundo azul claro
		titleEl.style.cursor = "pointer";
		titleEl.style.display = "inline-flex";
		titleEl.style.alignItems = "center";
		titleEl.style.gap = "0.25rem";
		titleEl.style.padding = "0.25rem 0.75rem";
		titleEl.style.borderRadius = "0.5rem";
		titleEl.style.borderBottom = "2px dashed #1e3a8a";
		titleEl.style.color = "#1e3a8a";
		titleEl.style.transition = "background-color 0.15s, color 0.15s";
		titleEl.title = "Clique para escolher um dia";

		// Limpa handlers antigos antes de reatribuir
		if (titleEl._dayPickerHandler)
			titleEl.removeEventListener("click", titleEl._dayPickerHandler);
		if (titleEl._dayPickerEnter)
			titleEl.removeEventListener("mouseenter", titleEl._dayPickerEnter);
		if (titleEl._dayPickerLeave)
			titleEl.removeEventListener("mouseleave", titleEl._dayPickerLeave);

		const onEnter = () => {
			titleEl.style.backgroundColor = "rgba(30, 58, 138, 0.1)";
		};
		const onLeave = () => {
			titleEl.style.backgroundColor = "";
		};

		const handler = () => {
			const input = dateInputRef.current;
			if (!input) return;
			const inputWithPicker = input as HTMLInputElement & {
				showPicker?: () => void;
			};
			try {
				if (typeof inputWithPicker.showPicker === "function") {
					inputWithPicker.showPicker();
				} else {
					input.click();
				}
			} catch {
				input.click();
			}
		};

		titleEl.addEventListener("click", handler);
		titleEl.addEventListener("mouseenter", onEnter);
		titleEl.addEventListener("mouseleave", onLeave);
		titleEl._dayPickerHandler = handler;
		titleEl._dayPickerEnter = onEnter;
		titleEl._dayPickerLeave = onLeave;
	}

	useEffect(() => {
		const userDataString = localStorage.getItem("userData");
		if (userDataString) {
			const userData = JSON.parse(userDataString);
			const perfilNome = String(userData.perfil || "").toLowerCase();
			setUserPerfil(perfilNome);
		}
	}, []);

	const temPermissaoGeral =
		userPerfil === "admin" ||
		userPerfil === "coordenador" ||
		userPerfil === "professor";

	// Apenas admin e coordenador podem gerenciar indisponibilidades
	const temPermissaoIndisponibilidade =
		userPerfil === "admin" || userPerfil === "coordenador";
	//Função para exibir notificações
	function showNotification(
		type: "success" | "error" | "warning",
		message: string,
	) {
		setNotification({
			type,
			message,
			show: true,
		});

		// Ocultar automaticamente após 5 segundos
		setTimeout(() => {
			setNotification((prev) => ({ ...prev, show: false }));
		}, 5000);
	}

	//Função para lidar com o clique na data// Função para lidar com o clique na data (quadradinho vazio)
	function handleDateClick(arg: { date: Date; dateStr: string }) {
		const isIndisponivel = events.some((e) => {
			// 1. Verificação de segurança: Se não houver start, ignora esse evento no loop
			if (!e.start) return false;

			let eventDateStr: string;

			// 2. Extração segura da data do evento
			if (e.start instanceof Date) {
				eventDateStr = e.start.toISOString().split("T")[0];
			} else if (typeof e.start === "string") {
				eventDateStr = e.start.split("T")[0];
			} else {
				// Caso seja um tipo inesperado, tentamos converter com segurança
				const d = new Date(e.start as string | number | Date);
				eventDateStr = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
			}

			// 3. Compara apenas a parte YYYY-MM-DD
			const clickedDate = arg.dateStr.split("T")[0];

			return (
				e.extendedProps?.status === "indisponivel" &&
				eventDateStr === clickedDate
			);
		});

		if (isIndisponivel) {
			return;
		}

		// Limpa o estado completamente para uma nova consulta
		// Usa o dateStr para garantir a string "YYYY-MM-DD" perfeitamente
		setNewEvent({
			title: "",
			start: arg.dateStr,
			paciente_id: undefined,
			aluno_id: undefined,
			horario_id: undefined,
		});

		// Professor vai direto para o cadastro de consulta (sem opção de indisponibilidade)
		if (!temPermissaoIndisponibilidade) {
			setShowModal(true);
			return;
		}

		setActionModalMode("default");
		setShowActionModal(true);
	}

	// Função para tornar o dia indisponível
	async function handleMakeUnavailable() {
		if (!newEvent || !newEvent.start) return;

		const dataString =
			newEvent.start instanceof Date
				? newEvent.start.toISOString().split("T")[0]
				: new Date(newEvent.start).toISOString().split("T")[0];

		const payload = {
			data_indisponivel: dataString,
			descricao: "Dia Indisponível",
			hora_inicio: "00:00", // ou null, dependendo do seu banco
			hora_fim: "23:59",
		};

		try {
			const response = await api.post("/indisponibilidade", payload);
			// Atualizamos o estado de indisponibilidades.
			// O useEffect vai detectar isso e redesenhar o calendário sozinho.
			setIndisponibilidades((prev) => [...prev, response.data]);

			// Remove do estado local as consultas que foram excluídas pelo backend
			setConsulta((prev) =>
				prev.filter((c) => {
					const dataConsulta =
						typeof c.data_consulta === "string"
							? c.data_consulta.split("T")[0]
							: c.data_consulta.toISOString().split("T")[0];
					return dataConsulta !== dataString;
				}),
			);

			setShowActionModal(false);
			showNotification("success", "Dia bloqueado com sucesso!");
		} catch (error) {
			console.error(error);
			showNotification("error", "Erro ao salvar indisponibilidade.");
		}
	}
	// Função para remover a indisponibilidade do dia
	async function handleMakeAvailable() {
		if (!selectedUnavailableEventId) return;

		// O ID do FullCalendar é "block-123", pegamos o ID real do banco no extendedProps
		const eventoVisual = events.find(
			(e) => e.id === selectedUnavailableEventId,
		);
		const realId = eventoVisual?.extendedProps?.dbId;

		if (!realId) {
			showNotification("error", "ID do bloqueio não encontrado.");
			return;
		}

		try {
			await api.delete(`/indisponibilidade/${realId}`);
			// Remove do estado local para o calendário atualizar
			setIndisponibilidades((prev) => prev.filter((ind) => ind.id !== realId));
			setShowActionModal(false);
			setSelectedUnavailableEventId(null);
			showNotification("success", "Dia liberado com sucesso!");
		} catch (error) {
			console.error(error);
			showNotification("error", "Erro ao remover bloqueio.");
		}
	}
	//Função para lidar com o envio do formulário
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!newEvent.paciente_id || !newEvent.aluno_id || !newEvent.horario_id) {
			showNotification("warning", "Por favor, preencha todos os campos.");
			return;
		}
		let dataFinal = "";
		if (typeof newEvent.start === "string") {
			dataFinal = newEvent.start.split("T")[0];
		} else {
			dataFinal = new Date(newEvent.start).toISOString().split("T")[0];
		}
		const novaConsulta: Consulta = {
			paciente_id: Number(newEvent.paciente_id),
			aluno_id: Number(newEvent.aluno_id),
			horario_id: Number(newEvent.horario_id),
			// Converte para YYYY-MM-DD (formato DATE do MySQL)
			data_consulta: dataFinal,
			status: "agendada",
		};

		//Valida todos os campos antes de enviar
		const pacienteError = validateField("paciente_id", newEvent.paciente_id);
		const fisioterapeutaError = validateField("aluno_id", newEvent.aluno_id);
		const horarioError = validateField("horario_id", newEvent.horario_id);

		if (pacienteError || fisioterapeutaError || horarioError) {
			setFormErrors({
				paciente_id: pacienteError,
				aluno_id: fisioterapeutaError,
				horario_id: horarioError,
			});
			showNotification(
				"warning",
				"Por favor, preencha todos os campos obrigatórios.",
			);
			return;
		}

		try {
			//Chamada para a API para salvar a nova consulta
			const response = await api.post("/consulta", novaConsulta);

			//Atualiza o estado com a nova consulta retornada pela API
			setConsulta([...consulta, response.data]);

			//Fecha o modal após salvar
			handleCloseModal();

			//Notificação de sucesso
			showNotification("success", "Consulta agendada com sucesso!");
		} catch (error) {
			if (error instanceof Error) {
				console.error("Erro ao agendar consulta:", error.message);
				showNotification("error", `Erro ao agendar consulta: ${error.message}`);
			} else {
				console.error("Erro desconhecido:", error);
				showNotification("error", "Erro desconhecido ao agendar consulta");
			}
		}
	};

	//Função para lidar com a abertura do modal de exclusão
	function handleDeleteModal(data: EventClickArg) {
		setShowDeleteModal(true);
		setEventToDelete({
			id: Number(data.event.id),
			pacienteNome: data.event.extendedProps?.pacienteNome,
			alunoNome: data.event.extendedProps?.alunoNome,
			horario: data.event.extendedProps?.horario,
		});
	}

	//Função para lidar com a exclusão da consulta
	async function handleDelete() {
		if (!eventToDelete || !eventToDelete.id) {
			showNotification(
				"error",
				"Não foi possível identificar a consulta para exclusão.",
			);
			return;
		}

		try {
			//Chamada para a API para excluir a consulta
			await api.delete(`/consulta/${eventToDelete.id}`);

			//Atualiza o estado local removendo a consulta excluída
			setConsulta(
				consulta.filter((item) => Number(item.id) !== eventToDelete.id),
			);

			//Fecha o modal e reseta o estado
			setShowDeleteModal(false);
			setEventToDelete(null);

			//Feedback para o usuário
			showNotification(
				"success",
				`Consulta de ${eventToDelete.pacienteNome} excluída com sucesso!`,
			);
		} catch (error) {
			console.error("Erro ao excluir consulta:", error);
			showNotification(
				"error",
				"Erro ao excluir consulta. Tente novamente mais tarde.",
			);
		}
	}

	//Função para fechar o modal e resetar o estado
	function handleCloseModal() {
		setShowActionModal(false);
		setShowModal(false);
		setNewEvent({
			title: "",
			start: "",
			id: 0,
			aluno_id: 0,
			paciente_id: 0,
			horario_id: 0,
			status: "",
		});
		setShowDeleteModal(false);
		setEventToDelete(null);
	}

	//Adicione este estado
	const [formErrors, setFormErrors] = useState({
		paciente_id: "",
		aluno_id: "",
		horario_id: "",
	});

	//Função de validação
	function validateField(
		field: string,
		value: string | number | null | undefined,
	): string {
		if (!value && value !== 0) {
			// Permitir o valor 0 como válido para campos numéricos
			return `Este campo é obrigatório`;
		}
		return "";
	}

	//Efeito para buscar as consultas ao carregar a página
	useEffect(() => {
		api
			.get<Consulta[]>("/consulta")
			.then((response) => {
				setConsulta(response.data);
			})
			.catch((err) => {
				console.error("Ops! Ocorreu um erro: " + err);
			});

		api
			.get<Indisponibilidade[]>("/indisponibilidade")
			.then((response) => setIndisponibilidades(response.data))
			.catch((err) =>
				console.error("Erro ao carregar indisponibilidades: " + err),
			);
	}, []);

	//Efeito para buscar pacientes, alunos e horários ao carregar a página
	useEffect(() => {
		api.get("/paciente").then((res) => setPacientes(res.data));
		api
			.get("/usuario/fisioterapeutas")
			.then((res) => setFisioterapeutas(res.data));
		api.get("/horario").then((res) => setHorarios(res.data));
	}, []);

	//Efeito para transformar as consultas em eventos do FullCalendar
	useEffect(() => {
		// Aplica os filtros de Aluno e Paciente de forma cumulativa
		const consultasFiltradas = consulta.filter((item) => {
			const matchAluno =
				filtroAlunoId === "all" || String(item.aluno_id) === filtroAlunoId;
			const matchPaciente =
				filtroPacienteId === "all" ||
				String(item.paciente_id) === filtroPacienteId;
			return matchAluno && matchPaciente;
		});

		const eventos: EventInput[] = consultasFiltradas.map((item) => {
			const paciente = pacientes.find((p) => p.id === item.paciente_id);
			const fisioterapeuta = fisioterapeutas.find(
				(f) => f.id === item.aluno_id,
			);

			const horario = horarios.find((h) => h.id === item.horario_id);

			// Extrai a data (YYYY-MM-DD) da data_consulta
			const data =
				typeof item.data_consulta === "string"
					? item.data_consulta.split("T")[0]
					: item.data_consulta.toISOString().split("T")[0];

			let dataHoraISO: string | Date = item.data_consulta;

			// Só monta a string se ambos existirem e forem válidos
			if (horario?.horario && data) {
				// Garante que o horário fique no formato "HH:mm:00"
				const horarioFormatado = `${horario.horario}`;
				const dataHoraString = `${data}T${horarioFormatado}`;
				const dataHora = new Date(dataHoraString);
				if (!isNaN(dataHora.getTime())) {
					dataHoraISO = dataHora.toISOString();
				} else {
					dataHoraISO = item.data_consulta;
				}
			}

			// Informações formatadas para exibição
			const pacienteNome = paciente?.nome_completo ?? "Paciente não informado";
			const fisioterapeutaNome =
				fisioterapeuta?.nome_completo ?? "Aluno não informado";

			//Criação do evento
			return {
				id: String(item.id), // Convertendo para string para evitar erro de tipagem
				title: `Paciente: ${pacienteNome} | Aluno: ${fisioterapeutaNome}`,
				start: dataHoraISO,
				startStr: horario?.horario ? `${horario.horario}` : "",
				extendedProps: {
					pacienteId: item.paciente_id,
					fisioterapeutaId: item.aluno_id,
					horarioId: item.horario_id,
					status: item.status,
					pacienteNome: pacienteNome,
					fisioterapeutaNome: fisioterapeutaNome,
					horario: horario?.horario || "",
				},
			};
		});
		// 2. Mapeia as indisponibilidades
		const eventosIndisponiveis: EventInput[] = indisponibilidades.map((ind) => {
			return {
				id: `block-${ind.id}`,
				title: ind.descricao || "Dia Indisponível",
				start: ind.data_indisponivel,
				allDay: true,
				backgroundColor: "#EF4444",
				borderColor: "#EF4444",
				extendedProps: {
					status: "indisponivel",
					dbId: ind.id,
					durationEditable: false,
					startEditable: false,
					editable: false,
				},
			};
		});
		setEvents([...eventos, ...eventosIndisponiveis]);
	}, [
		consulta,
		pacientes,
		fisioterapeutas,
		horarios,
		indisponibilidades,
		filtroAlunoId,
		filtroPacienteId,
	]);

	// Re-aplica o título clicável após re-renders do FullCalendar causados
	// por mudanças no estado events (que não disparam datesSet).
	useEffect(() => {
		const timer = setTimeout(tornarTituloClicavel, 0);
		return () => clearTimeout(timer);
	}, [events]);

	return (
		<RouteGuard>
			{/* Sistema de notificações */}
			<div
				className={`fixed top-24 right-8 max-w-sm p-4 rounded-md shadow-lg transition-all duration-300 ${
					notification.show
						? "opacity-100 transform translate-y-0"
						: "opacity-0 transform -translate-y-4"
				} ${
					notification.type === "success"
						? "bg-green-50 text-green-800 border-l-4 border-green-500"
						: notification.type === "error"
							? "bg-red-50 text-red-800 border-l-4 border-red-500"
							: "bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500"
				}`}
				style={{
					zIndex: 9999,
					pointerEvents: notification.show ? "auto" : "none",
				}}
			>
				<div className='flex items-center'>
					<div className='flex-shrink-0'>
						{notification.type === "success" ? (
							<CheckIcon className='h-5 w-5 text-green-500' />
						) : notification.type === "error" ? (
							<ExclamationTriangleIcon className='h-5 w-5 text-red-500' />
						) : (
							<ExclamationTriangleIcon className='h-5 w-5 text-yellow-500' />
						)}
					</div>
					<div className='ml-3'>
						<p className='text-sm font-medium'>{notification.message}</p>
					</div>
					<div className='ml-auto pl-3'>
						<div className='-mx-1.5 -my-1.5'>
							<button
								type='button'
								onClick={() =>
									setNotification((prev) => ({ ...prev, show: false }))
								}
								className={`inline-flex rounded-md p-1.5 ${
									notification.type === "success"
										? "text-green-500 hover:bg-green-100"
										: notification.type === "error"
											? "text-red-500 hover:bg-red-100"
											: "text-yellow-500 hover:bg-yellow-100"
								}`}
							>
								<span className='sr-only'>Fechar</span>
								<svg
									className='h-4 w-4'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			<NavBar />
			<TopBar title='Disponibilidade' />

			{/* Criação do componente calendário */}
			<main className='flex flex-col min-h-screen justify-center items-center p-0'>
				<div className='flex justify-center items-center w-full'>
					<div className='relative w-full px-2 mt-20 md:ml-[288px] md:w-[calc(85vw-320px)] md:px-0'>
						{/* Input de data oculto, disparado ao clicar no título do calendário */}
						<input
							ref={dateInputRef}
							type='date'
							onChange={(e) => irParaDia(e.target.value)}
							aria-hidden='true'
							tabIndex={-1}
							className='pointer-events-none absolute left-1/2 top-12 h-0 w-0 -translate-x-1/2 opacity-0'
						/>

						{/* Filtros de busca: Aluno e Paciente */}
						<div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
							<div className='flex flex-col'>
								<label
									htmlFor='filtro-aluno'
									className='mb-1 text-sm font-medium text-gray-700'
								>
									Filtrar por Aluno
								</label>
								<select
									id='filtro-aluno'
									value={filtroAlunoId}
									onChange={(e) => setFiltroAlunoId(e.target.value)}
									className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950'
								>
									<option value='all'>Todos</option>
									{fisioterapeutas.filter((f) => f.ativo !== 0).map((f) => (
										<option key={f.id} value={String(f.id)}>
											{f.nome_completo}
										</option>
									))}
								</select>
							</div>
							<div className='flex flex-col'>
								<label
									htmlFor='filtro-paciente'
									className='mb-1 text-sm font-medium text-gray-700'
								>
									Filtrar por Paciente
								</label>
								<select
									id='filtro-paciente'
									value={filtroPacienteId}
									onChange={(e) => setFiltroPacienteId(e.target.value)}
									className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-950'
								>
									<option value='all'>Todos</option>
									{pacientes.filter((p) => p.ativo !== 0).map((p) => (
										<option key={p.id} value={String(p.id)}>
											{p.nome_completo}
										</option>
									))}
								</select>
							</div>
						</div>

						<FullCalendar
							ref={calendarRef}
							//Reaplica o handler de clique no título sempre que a visualização muda
							//(o FullCalendar recria o elemento `.fc-toolbar-title` a cada render).
							datesSet={tornarTituloClicavel}
							//Opções do calendário
							plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
							//Configuração do cabeçalho do calendário

							headerToolbar={{
								start: "prev,next today",
								center: "title",
								end: "dayGridMonth,timeGridWeek,timeGridDay",
							}}
							eventDurationEditable={false} // Impede de esticar o evento (mudar a duração)
							eventStartEditable={false} // Impede de arrastar o evento para outro dia
							eventResizableFromStart={false} // Garante que não apareça a "alça" de redimensionar
							//Tempo de duração do horário
							slotDuration={"01:00:00"}
							//Calendário com eventos
							events={events}
							//Indica o horário atual
							nowIndicator={true}
							//Permite interação com o calendário
							editable={true}
							//Configuração do tooltip
							eventDidMount={(info) => {
								// Verifica se é mobile (tela menor ou igual a 768px).
								// Se for, encerra a função aqui mesmo e não cria o tooltip.
								if (window.innerWidth <= 768) {
									return;
								}
								if (info.event.extendedProps.status === "indisponivel") {
									return;
								}
								//Cria um elemento tooltip personalizado
								const tooltip = document.createElement("div");
								tooltip.className = "fc-event-tooltip";
								tooltip.innerHTML = `
                  <div class="bg-white border border-gray-200 rounded p-2 shadow-lg text-sm">
                    <p><strong>Paciente:</strong> ${
											info.event.extendedProps.pacienteNome || "Não informado"
										}</p>
                    <p><strong>Aluno:</strong> ${
											info.event.extendedProps.fisioterapeutaNome ||
											"Não informado"
										}</p>
                    <p><strong>Horário:</strong> ${
											info.event.extendedProps.horario || "Não informado"
										}</p>
                  </div>
                `;
								tooltip.style.position = "absolute";
								tooltip.style.zIndex = "10000";
								tooltip.style.display = "none";

								document.body.appendChild(tooltip);

								// Armazena referência no elemento para cleanup via eventWillUnmount
								(
									info.el as HTMLElement & { _tooltip?: HTMLDivElement }
								)._tooltip = tooltip;

								// Handlers nomeados para remoção limpa
								const handleMouseEnter = () => {
									const rect = info.el.getBoundingClientRect();

									// Define tooltip como visível mas fora da tela para poder calcular dimensões
									tooltip.style.display = "block";
									tooltip.style.left = "-9999px";
									tooltip.style.top = "-9999px";

									// Obtém as dimensões do tooltip
									const tooltipRect = tooltip.getBoundingClientRect();
									const tooltipWidth = tooltipRect.width;
									const tooltipHeight = tooltipRect.height;

									// Verifica espaço à direita
									const spaceRight = window.innerWidth - rect.right;
									// Verifica espaço abaixo
									const spaceBottom = window.innerHeight - rect.top;

									// Posicionamento horizontal
									if (spaceRight >= tooltipWidth + 10) {
										tooltip.style.left = rect.right + 10 + "px";
									} else {
										tooltip.style.left = rect.left - tooltipWidth - 10 + "px";
									}

									// Posicionamento vertical
									if (spaceBottom >= tooltipHeight + 10) {
										tooltip.style.top = rect.top + "px";
									} else {
										const topPosition = Math.max(
											10,
											rect.bottom - tooltipHeight,
										);
										tooltip.style.top = topPosition + "px";
									}
								};

								const handleMouseLeave = () => {
									tooltip.style.display = "none";
								};

								info.el.addEventListener("mouseenter", handleMouseEnter);
								info.el.addEventListener("mouseleave", handleMouseLeave);

								// Armazena handlers para remoção no unmount
								(
									info.el as HTMLElement & {
										_tooltipHandlers?: { enter: () => void; leave: () => void };
									}
								)._tooltipHandlers = {
									enter: handleMouseEnter,
									leave: handleMouseLeave,
								};
							}}
							// Cleanup correto: remove tooltip do DOM e listeners do elemento
							eventWillUnmount={(info) => {
								const el = info.el as HTMLElement & {
									_tooltip?: HTMLDivElement;
									_tooltipHandlers?: { enter: () => void; leave: () => void };
								};
								if (el._tooltip && document.body.contains(el._tooltip)) {
									document.body.removeChild(el._tooltip);
								}
								if (el._tooltipHandlers) {
									el.removeEventListener(
										"mouseenter",
										el._tooltipHandlers.enter,
									);
									el.removeEventListener(
										"mouseleave",
										el._tooltipHandlers.leave,
									);
								}
							}}
							//Permite selecionar eventos
							selectable={true}
							//Permite selecionar múltiplos dias
							selectMirror={true}
							//Configuração do idioma
							locale={esLocale}
							//Configuração de visualização inicial
							initialView='dayGridMonth'
							//Configuração de horários de trabalho
							businessHours={{
								start: "14:00",
								end: "16:00",
								daysOfWeek: [1, 2, 3, 4, 5], // Seg - Sex
							}}
							//Permite adicionar eventos ao clicar em uma data
							dateClick={handleDateClick}
							//Permite editar eventos ao clicar
							eventClick={(data) => {
								if (data.event.extendedProps?.status === "indisponivel") {
									// Apenas admin/coordenador podem interagir com bloqueios
									if (!temPermissaoIndisponibilidade) {
										return;
									}
									setActionModalMode("unavailable");
									setSelectedUnavailableEventId(data.event.id);
									setShowActionModal(true);
								} else {
									handleDeleteModal(data);
								}
							}}
							//Configuração de altura do calendário
							height={600}
							//Configuração de expansão de linhas
							expandRows={true}
							//Configuração das datas do cabeçalho
							stickyHeaderDates={true}
							//Configuração de eventos máximos do dia
							dayMaxEvents={true}
							//Configuração de janela de redimensionamento
							handleWindowResize={true}
							//Tempo de inicialização do calendário
							slotMinTime='14:00:00'
							//Tempo de finalização do calendário
							slotMaxTime='17:00:00'
							//Configuração de tempo de rolagem
							scrollTime='08:00:00'
						/>
					</div>
				</div>

				{/* Modal de excluir consulta */}
				<Transition.Root show={showDeleteModal} as={Fragment}>
					<Dialog
						as='div'
						className='relative z-10'
						onClose={setShowDeleteModal}
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
							<div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
								<Transition.Child
									as={Fragment}
									enter='ease-out duration-300'
									enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
									enterTo='opacity-100 translate-y-0 sm:scale-100'
									leave='ease-in duration-200'
									leaveFrom='opacity-100 translate-y-0 sm:scale-100'
									leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
								>
									<Dialog.Panel
										className='relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'
									>
										<div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
											<div className='sm:flex sm:items-start'>
												<div
													className='mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'
												>
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
														Excluir Consulta
													</Dialog.Title>
													<div className='mt-2'>
														<p className='text-sm text-gray-500'>
															Deseja excluir a consulta de{" "}
															<strong>
																{eventToDelete?.pacienteNome ||
																	"paciente não identificado"}
															</strong>{" "}
															com <strong>{eventToDelete?.alunoNome}</strong> às{" "}
															<strong>{eventToDelete?.horario}</strong>?
														</p>
													</div>
												</div>
											</div>
										</div>
										<div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
											<button
												type='button'
												className='inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto'
												onClick={handleDelete}
											>
												Excluir
											</button>
											<button
												type='button'
												className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
												onClick={handleCloseModal}
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
				{/* Modal de Escolha de Ação */}
				<Transition.Root show={showActionModal} as={Fragment}>
					<Dialog
						as='div'
						className='relative z-10'
						onClose={setShowActionModal}
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
							<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
								<Transition.Child
									as={Fragment}
									enter='ease-out duration-300'
									enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
									enterTo='opacity-100 translate-y-0 sm:scale-100'
									leave='ease-in duration-200'
									leaveFrom='opacity-100 translate-y-0 sm:scale-100'
									leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
								>
									<Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6'>
										<div>
											<div className='mt-3 text-center sm:mt-5'>
												<Dialog.Title
													as='h3'
													className='text-base font-semibold leading-6 text-gray-900'
												>
													Selecione uma ação
												</Dialog.Title>
												<div className='mt-2'>
													<p className='text-sm text-gray-500'>
														O que você deseja fazer para este dia?
													</p>
												</div>
											</div>
										</div>
										<div className='mt-5 sm:mt-6 flex flex-col space-y-3'>
											{actionModalMode === "default" ? (
												<>
													<button
														type='button'
														className='inline-flex w-full justify-center rounded-md bg-blue-950 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-950 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-950'
														onClick={() => {
															setShowActionModal(false);
															setShowModal(true);
														}}
													>
														Cadastrar consulta
													</button>

													{/* BOTÃO DE BLOQUEIO: Só aparece para Admin e Coordenador */}
													{temPermissaoIndisponibilidade && (
														<button
															type='button'
															className='inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-600'
															onClick={handleMakeUnavailable}
														>
															Tornar dia indisponível
														</button>
													)}
												</>
											) : (
												/* BOTÃO DE LIBERAR DIA: Só aparece para Admin e Coordenador */
												temPermissaoIndisponibilidade && (
													<button
														type='button'
														className='inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600'
														onClick={handleMakeAvailable}
													>
														Deixar dia disponível
													</button>
												)
											)}

											<button
												type='button'
												className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
												onClick={() => setShowActionModal(false)}
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

				{/* Modal de adicionar nova consulta */}
				<Transition.Root show={showModal} as={Fragment}>
					<Dialog as='div' className='relative z-10' onClose={setShowModal}>
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
							<div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
								<Transition.Child
									as={Fragment}
									enter='ease-out duration-300'
									enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
									enterTo='opacity-100 translate-y-0 sm:scale-100'
									leave='ease-in duration-200'
									leaveFrom='opacity-100 translate-y-0 sm:scale-100'
									leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
								>
									<Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-6 pb-6 pt-5 text-left shadow-xl transition-all w-auto'>
										<div>
											<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
												<CheckIcon
													className='h-6 w-6 text-green-600'
													aria-hidden='true'
												/>
											</div>
											<div className='mt-3 text-center sm:mt-5'>
												<Dialog.Title
													as='h3'
													className='text-base font-semibold leading-6 text-gray-900'
												>
													Adicionar Consulta
												</Dialog.Title>
												<form
													onSubmit={handleSubmit}
													className='mt-4 flex flex-col space-y-4 w-full items-center'
												>
													<div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
														<div className='w-full'>
															<label className='block text-sm font-medium text-gray-700 mb-1'>
																Paciente
															</label>
															{/* Importação dinâmica dos pacientes, dos
                              fisioterapeutas e dos horários cadastrados */}
															<Select
																value={newEvent.paciente_id ?? ""}
																onChange={(e) => {
																	const value = Number(e.target.value);
																	setNewEvent({
																		...newEvent,
																		paciente_id: value,
																	});
																	setFormErrors({
																		...formErrors,
																		paciente_id: validateField(
																			"paciente_id",
																			value,
																		),
																	});
																}}
																required
																className={`w-full rounded-md border ${
																	formErrors.paciente_id
																		? "border-red-500"
																		: "border-gray-300"
																} px-4 py-3 text-base select-custom`}
															>
																<option value=''>Selecione o paciente</option>
																{pacientes.filter((p) => p.ativo !== 0).map((p) => (
																	<option key={p.id} value={p.id}>
																		{p.nome_completo}
																	</option>
																))}
															</Select>
															{formErrors.paciente_id && (
																<p className='mt-1 text-sm text-red-600'>
																	{formErrors.paciente_id}
																</p>
															)}
														</div>
														<div className='w-full'>
															<label className='block text-sm font-medium text-gray-700 mb-1'>
																Aluno
															</label>
															<Select
																value={newEvent.aluno_id ?? ""}
																onChange={(e) => {
																	const value = Number(e.target.value);
																	setNewEvent({
																		...newEvent,
																		aluno_id: value,
																	});
																	setFormErrors({
																		...formErrors,
																		aluno_id: validateField("aluno_id", value),
																	});
																}}
																required
																className={`w-full rounded-md border ${
																	formErrors.aluno_id
																		? "border-red-500"
																		: "border-gray-300"
																} px-4 py-3 text-base select-custom`}
															>
																<option value=''>Selecione o Aluno</option>
																{fisioterapeutas.filter((f) => f.ativo !== 0).map((f) => (
																	<option key={f.id} value={f.id}>
																		{f.nome_completo}
																	</option>
																))}
															</Select>
															{formErrors.aluno_id && (
																<p className='mt-1 text-sm text-red-600'>
																	{formErrors.aluno_id}
																</p>
															)}
														</div>
														<div className='w-full'>
															<label className='block text-sm font-medium text-gray-700 mb-1'>
																Horário
															</label>
															<Select
																value={newEvent.horario_id ?? ""}
																onChange={(e) => {
																	const value = Number(e.target.value);
																	setNewEvent({
																		...newEvent,
																		horario_id: value,
																	});
																	setFormErrors({
																		...formErrors,
																		horario_id: validateField(
																			"horario_id",
																			value,
																		),
																	});
																}}
																required
																className={`w-full rounded-md border ${
																	formErrors.horario_id
																		? "border-red-500"
																		: "border-gray-300"
																} px-4 py-3 text-base select-custom`}
															>
																<option value=''>Selecione o horário</option>
																{horarios.map((h) => (
																	<option key={h.id} value={h.id}>
																		{h.horario}
																	</option>
																))}
															</Select>
															{formErrors.horario_id && (
																<p className='mt-1 text-sm text-red-600'>
																	{formErrors.horario_id}
																</p>
															)}
														</div>
													</div>

													<div className='mt-5 flex justify-center space-x-4'>
														<button
															type='button'
															className='inline-flex justify-center rounded-md bg-gray-300 px-5 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-400'
															onClick={() => setShowModal(false)}
														>
															Voltar
														</button>
														<button
															type='submit'
															className='inline-flex justify-center rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500'
														>
															Criar
														</button>
													</div>
												</form>
											</div>
										</div>
									</Dialog.Panel>
								</Transition.Child>
							</div>
						</div>
					</Dialog>
				</Transition.Root>
			</main>
		</RouteGuard>
	);
}
