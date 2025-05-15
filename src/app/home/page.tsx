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
  Evento,
  Paciente,
  Fisioterapeuta,
  Horario,
} from "../interfaces/types";

export default function Disponibilidade() {
  const [consulta, setConsulta] = useState<Consulta[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [newEvent, setNewEvent] = useState<Evento>({
    title: 0,
    start: "",
  });
  const [todasConsultas, setTodasConsultas] = useState<Consulta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  function handleDateClick(arg: { date: Date }) {
    setNewEvent({ ...newEvent, start: arg.date, id: new Date().getTime() });
    setShowModal(true);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const novaConsulta: Consulta = {
      paciente_id: newEvent.paciente_id!,
      fisioterapeuta_id: newEvent.fisioterapeuta_id!,
      horario_id: newEvent.horario_id!,
      data_consulta:
        typeof newEvent.start === "string"
          ? new Date(newEvent.start).toISOString()
          : newEvent.start.toISOString(),
      status: newEvent.status ?? "agendada",
    };
    console.log("Enviando para API:", novaConsulta);
    await api.post("/consulta", novaConsulta);

    try {
      const response = await api.post("/consulta", novaConsulta);
      console.log("Consulta salva:", response.data);
    } catch (error) {
      console.error("Erro ao salvar consulta:", error);
    }
  };

  function handleDeleteModal(data: { event: { id: string } }) {
    setShowDeleteModal(true);
    setIdToDelete(Number(data.event.id));
  }

  function handleDelete() {
    setTodasConsultas(
      todasConsultas.filter((event) => Number(event.id) !== Number(idToDelete))
    );
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  function handleCloseModal() {
    setShowModal(false);
    setNewEvent({
      title: "",
      start: "",
      id: 0,
      fisioterapeuta_id: 0,
      paciente_id: 0,
      horario_id: 0,
      status: "",
    });
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  //   setNewEvent({
  //     ...newEvent,
  //     title: e.target.value,
  //   });
  // };

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
      const horario = horarios.find((h) => h.id === item.horario_id);

      return {
        id: item.id !== undefined ? String(item.id) : undefined,
        title: `${paciente?.nome_completo ?? ""} - ${horario?.horario ?? ""}`,
        start: item.data_consulta,
      };
    });
    setEvents(eventos);
  }, [consulta, pacientes, horarios]);

  return (
    <>
      <NavBar />
      <TopBar title="Disponibilidade" />

      <main className="flex flex-col min-h-screen justify-center items-center p-0">
        <div className="flex justify-center items-center w-full">
          <div className="ml-[288px] mt-20 w-[calc(90vw-320px)] min-h-[600px]">
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
              dateClick={handleDateClick}
              eventClick={(data) => handleDeleteModal(data)}
              height={600}
              expandRows={true}
              stickyHeaderDates={true}
              dayMaxEvents={true}
              handleWindowResize={true}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
              allDaySlot={false}
              scrollTime="08:00:00"
            />
          </div>
        </div>
      </main>
    </>
  );
}
