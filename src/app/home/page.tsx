"use client";

//Importações necessárias
import api from "@/app/services/api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/pt-br";
import { EventInput } from "@fullcalendar/core";

import { useEffect, useState } from "react";
import { useNotification } from "../components/Notification";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import RouteGuard from "../components/RouteGuard";

//Importação das tipagens necessárias
import {
	Consulta,
	Paciente,
	Fisioterapeuta,
	Horario,
	Indisponibilidade,
} from "../interfaces/types";

export default function Home() {
	//Definindo os estados para armazenar os dados
	const [indisponibilidades, setIndisponibilidades] = useState<
		Indisponibilidade[]
	>([]);
	const [consulta, setConsulta] = useState<Consulta[]>([]);
	const [events, setEvents] = useState<EventInput[]>([]);
	const [pacientes, setPacientes] = useState<Paciente[]>([]);
	const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
	const [horarios, setHorarios] = useState<Horario[]>([]);
	const [nomeUsuario, setNomeUsuario] = useState("");

	//Importar o hook de notificação
	const { showNotification } = useNotification();

	useEffect(() => {
		api
			.get<Indisponibilidade[]>("/indisponibilidade")
			.then((response) => setIndisponibilidades(response.data))
			.catch((err) =>
				console.error("Erro ao carregar indisponibilidades: " + err),
			);
	}, []);

	//Verificar se houve login recente e mostrar notificação
	useEffect(() => {
		const loginSuccess = sessionStorage.getItem("loginSuccess");

		if (loginSuccess === "true") {
			//Buscar dados do usuário no localStorage
			const userDataString = localStorage.getItem("userData");
			let perfilUsuario = "";

			if (userDataString) {
				try {
					//Salvar o nome do usuário e o perfil
					const userData = JSON.parse(userDataString);
					perfilUsuario = userData.perfil || "";
					setNomeUsuario(userData.nome || "");
				} catch (e) {
					console.error("Erro ao analisar dados do usuário:", e);
				}
			}

			//Mostrar notificação de login bem-sucedido com o perfil
			const mensagemBoasVindas = perfilUsuario
				? `Login realizado com sucesso! Bem-vindo ${perfilUsuario}!`
				: "Login realizado com sucesso! Bem-vindo(a)!";

			showNotification("success", mensagemBoasVindas);

			//Remover a flag para não mostrar a notificação novamente
			sessionStorage.removeItem("loginSuccess");
		}
	}, [showNotification]);

	//Carregar dados de consultas e mostrar notificação em caso de erro
	useEffect(() => {
		api
			.get<Consulta[]>("/consulta")
			.then((response) => {
				setConsulta(response.data);
			})
			.catch((err) => {
				console.error("Ops! Ocorreu um erro: " + err);
				showNotification(
					"error",
					"Não foi possível carregar as consultas. Tente novamente mais tarde.",
				);
			});
	}, [showNotification]);

	//Carregar outros dados e mostrar notificação em caso de erro
	useEffect(() => {
		Promise.all([
			api.get("/paciente"),
			api.get("/usuario"),
			api.get("/horario"),
		])
			.then(([resPacientes, resUsuarios, resHorarios]) => {
				setPacientes(resPacientes.data);
				setFisioterapeutas(resUsuarios.data);
				setHorarios(resHorarios.data);
			})
			.catch((error) => {
				console.error("Erro ao carregar dados:", error);
				showNotification(
					"error",
					"Erro ao carregar alguns dados. Algumas informações podem estar incompletas.",
				);
			});
	}, [showNotification]);

	//Montar os eventos do calendário a partir dos dados de consulta
	useEffect(() => {
		const eventos: EventInput[] = consulta.map((item) => {
			const paciente = pacientes.find((p) => p.id === item.paciente_id);
			const fisioterapeuta = fisioterapeutas.find(
				(f) => f.id === item.fisioterapeuta_id,
			);
			const horario = horarios.find((h) => h.id === item.horario_id);

			//Extrai a data (YYYY-MM-DD) da data_consulta
			const data =
				typeof item.data_consulta === "string"
					? item.data_consulta.split("T")[0]
					: item.data_consulta.toISOString().split("T")[0];

			let dataHoraISO: string | Date = item.data_consulta;

			//Só monta a string se ambos existirem e forem válidos
			if (horario?.horario && data) {
				//Garante que o horário fique no formato "HH:mm:00"
				const horarioFormatado = `${horario.horario}`;
				const dataHoraString = `${data}T${horarioFormatado}`;
				const dataHora = new Date(dataHoraString);
				if (!isNaN(dataHora.getTime())) {
					dataHoraISO = dataHora.toISOString();
				} else {
					dataHoraISO = item.data_consulta;
				}
			}

			//Informações formatadas para exibição
			const pacienteNome = paciente?.nome_completo ?? "Paciente não informado";
			const fisioterapeutaNome =
				fisioterapeuta?.nome_completo ?? "Aluno não informado";

			//Retorna o objeto de evento formatado
			return {
				id: String(item.id), //Convertendo para string para evitar erro de tipagem
				title: `Paciente: ${pacienteNome} | Aluno: ${fisioterapeutaNome}`,
				start: dataHoraISO,
				startStr: horario?.horario ? `${horario.horario}` : "",
				extendedProps: {
					pacienteId: item.paciente_id,
					fisioterapeutaId: item.fisioterapeuta_id,
					horarioId: item.horario_id,
					status: item.status,
					pacienteNome: pacienteNome,
					fisioterapeutaNome: fisioterapeutaNome,
					horario: horario?.horario || "",
				},
			};
		});

		// 2. Mapeia as indisponibilidades para o formato do FullCalendar
		const eventosIndisponiveis: EventInput[] = indisponibilidades.map((ind) => {
			return {
				id: `block-${ind.id}`,
				title: ind.descricao || "Dia Indisponível",
				start: ind.data_indisponivel,
				allDay: true,
				backgroundColor: "#EF4444", // Vermelho
				borderColor: "#EF4444",
				extendedProps: {
					status: "indisponivel",
				},
			};
		});
		setEvents([...eventos, ...eventosIndisponiveis]);
	}, [consulta, pacientes, fisioterapeutas, horarios, indisponibilidades]);

	//Renderiza o componente principal
	return (
		<RouteGuard>
			<NavBar />
			<TopBar title={nomeUsuario ? `Bem-vindo, ${nomeUsuario}` : "Home"} />

			{/* Criação do componente calendário */}
			<main className='flex flex-col min-h-screen justify-center items-center p-0'>
				<div className='flex justify-center items-center w-full'>
					<div className='w-full px-2 mt-20 md:ml-[288px] md:w-[calc(85vw-320px)] md:px-0 cursor-default'>
						<FullCalendar
							//Opções do calendário
							plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
							//Configuração do cabeçalho do calendário
							headerToolbar={{
								start: "prev,next today",
								center: "title",
								end: "dayGridMonth,timeGridWeek,timeGridDay",
							}}
							//Tempo de duração do horário
							slotDuration={"01:00:00"}
							//Calendário com eventos
							events={events}
							//Indica o horário atual
							nowIndicator={true}
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
							//Configuração do tooltip
							eventDidMount={(info) => {
								if (info.event.extendedProps.status === "indisponivel") {
									return;
								}
								// Cria um elemento tooltip personalizado
								const tooltip = document.createElement("div");
								tooltip.className = "fc-event-tooltip";
								tooltip.innerHTML = `
          <div class="bg-white border border-gray-200 rounded p-2 shadow-lg text-sm">
            <p><strong>Paciente:</strong> ${
							info.event.extendedProps.pacienteNome || "Não informado"
						}</p>
            <p><strong>Aluno:</strong> ${
							info.event.extendedProps.fisioterapeutaNome || "Não informado"
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
								(info.el as HTMLElement & { _tooltip?: HTMLDivElement })._tooltip = tooltip;

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

									// Verifica se é mobile (telas com largura até 768px)
									const isMobile = window.innerWidth <= 768;

									if (isMobile) {
										tooltip.style.top = rect.bottom + 5 + "px";
										let leftPos = rect.left + rect.width / 2 - tooltipWidth / 2;
										leftPos = Math.max(
											10,
											Math.min(leftPos, window.innerWidth - tooltipWidth - 10),
										);
										tooltip.style.left = leftPos + "px";
									} else {
										const spaceRight = window.innerWidth - rect.right;
										const spaceBottom = window.innerHeight - rect.top;

										if (spaceRight >= tooltipWidth + 10) {
											tooltip.style.left = rect.right + 10 + "px";
										} else {
											tooltip.style.left = rect.left - tooltipWidth - 10 + "px";
										}

										if (spaceBottom >= tooltipHeight + 10) {
											tooltip.style.top = rect.top + "px";
										} else {
											const topPosition = Math.max(
												10,
												rect.bottom - tooltipHeight,
											);
											tooltip.style.top = topPosition + "px";
										}
									}
								};

								const handleMouseLeave = () => {
									tooltip.style.display = "none";
								};

								info.el.addEventListener("mouseenter", handleMouseEnter);
								info.el.addEventListener("mouseleave", handleMouseLeave);

								// Armazena handlers para remoção no unmount
								(info.el as HTMLElement & { _tooltipHandlers?: { enter: () => void; leave: () => void } })._tooltipHandlers = {
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
									el.removeEventListener("mouseenter", el._tooltipHandlers.enter);
									el.removeEventListener("mouseleave", el._tooltipHandlers.leave);
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
							//Configuração de slots de dia inteiro
							allDaySlot={true}
							//Configuração de tempo de rolagem
							scrollTime='08:00:00'
						/>
					</div>
				</div>
			</main>
		</RouteGuard>
	);
}
