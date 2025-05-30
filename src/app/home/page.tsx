"use client";

import api from "@/app/services/api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/pt-br";
import { EventInput } from "@fullcalendar/core";

import { useEffect, useState } from "react";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";

import {
  Consulta,
  Paciente,
  Fisioterapeuta,
  Horario,
} from "../interfaces/types";

export default function Disponibilidade() {
  const [consulta, setConsulta] = useState<Consulta[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    api
      .get<Consulta[]>("/consulta")
      .then((response) => {
        setConsulta(response.data);
      })
      .catch((err) => {
        console.error("Ops! Ocorreu um erro: " + err);
      });
  }, []);

  useEffect(() => {
    api.get("/paciente").then((res) => setPacientes(res.data));
    api.get("/usuario").then((res) => setFisioterapeutas(res.data));
    api.get("/horario").then((res) => setHorarios(res.data));
  }, []);

  useEffect(() => {
    const eventos: EventInput[] = consulta.map((item) => {
      const paciente = pacientes.find((p) => p.id === item.paciente_id);
      const fisioterapeuta = fisioterapeutas.find(
        (f) => f.id === item.fisioterapeuta_id
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
        fisioterapeuta?.nome_completo ?? "Fisioterapeuta não informado";

      return {
        id: String(item.id), // Convertendo para string para evitar erro de tipagem
        title: `Paciente: ${pacienteNome} | Fisioterapeuta: ${fisioterapeutaNome}`,
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
    setEvents(eventos);
  }, [consulta, pacientes, fisioterapeutas, horarios]);

  return (
    <>
      <NavBar />
      <TopBar title="Home" />

      <main className="flex flex-col min-h-screen justify-center items-center p-0">
        <div className="flex justify-center items-center w-full">
          <div className="ml-[288px] mt-20 w-[calc(90vw-320px)] min-h-[600px] cursor-default">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                start: "prev,next today",
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              slotDuration={"01:00:00"}
              events={events}
              nowIndicator={true}
              locale={esLocale}
              initialView="dayGridMonth"
              businessHours={{
                start: "14:00",
                end: "16:00",
                daysOfWeek: [1, 2, 3, 4, 5], // Seg - Sex
              }}
              eventDidMount={(info) => {
                // Cria um elemento tooltip personalizado
                const tooltip = document.createElement("div");
                tooltip.className = "fc-event-tooltip";
                tooltip.innerHTML = `
                  <div class="bg-white border border-gray-200 rounded p-2 shadow-lg text-sm">
                    <p><strong>Paciente:</strong> ${
                      info.event.extendedProps.pacienteNome || "Não informado"
                    }</p>
                    <p><strong>Fisioterapeuta:</strong> ${
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

                // Mostra o tooltip no hover com verificação de posição
                info.el.addEventListener("mouseenter", () => {
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
                    // Suficiente espaço à direita
                    tooltip.style.left = rect.right + 10 + "px";
                  } else {
                    // Não há espaço à direita, posicionar à esquerda
                    tooltip.style.left = rect.left - tooltipWidth - 10 + "px";
                  }

                  // Posicionamento vertical
                  if (spaceBottom >= tooltipHeight + 10) {
                    // Suficiente espaço abaixo
                    tooltip.style.top = rect.top + "px";
                  } else {
                    // Não há espaço abaixo, posicionar acima ou ajustar para caber na tela
                    const topPosition = Math.max(
                      10,
                      rect.bottom - tooltipHeight
                    );
                    tooltip.style.top = topPosition + "px";
                  }
                });

                // Esconde o tooltip quando o mouse sai
                info.el.addEventListener("mouseleave", () => {
                  tooltip.style.display = "none";
                });

                // Remove o tooltip quando o evento é desmontado
                return () => {
                  document.body.removeChild(tooltip);
                };
              }}
              height={600}
              expandRows={true}
              stickyHeaderDates={true}
              dayMaxEvents={true}
              handleWindowResize={true}
              slotMinTime="14:00:00"
              slotMaxTime="17:00:00"
              allDaySlot={false}
              scrollTime="08:00:00"
            />
          </div>
        </div>
      </main>
    </>
  );
}
