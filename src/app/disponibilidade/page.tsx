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

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition, Select } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";

//Importação das tipagens necessárias
import {
  Consulta,
  Evento,
  Paciente,
  Fisioterapeuta,
  Horario,
} from "../interfaces/types";

export default function Disponibilidade() {
  //Definindo os estados para armazenar os dados
  const [consulta, setConsulta] = useState<Consulta[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [newEvent, setNewEvent] = useState<Evento>({
    title: 0,
    start: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [formErrors, setFormErrors] = useState({
    paciente_id: "",
    fisioterapeuta_id: "",
    horario_id: "",
  });

  //Função de validação
  function validateField(
    field: string,
    value: string | number | null | undefined
  ): string {
    if (!value && value !== 0) {
      return `Este campo é obrigatório`;
    }
    return "";
  }

  //Efeito para buscar as consultas ao carregar a página
  useEffect(() => {
    api.get("/consulta").then((response) => {
      setConsulta(response.data);
    });
  }, []);

  //Efeito para buscar pacientes, fisioterapeutas e horários ao carregar a página
  useEffect(() => {
    api.get("/paciente").then((res) => setPacientes(res.data));

    // 🔥 FILTRO APLICADO AQUI
    api.get("/usuario").then((res) => {
      const alunos = res.data.filter(
        (u: any) =>
          u.role === "aluno" ||
          u.role === "student" ||
          u.tipo === "aluno" ||
          u.perfil === "aluno"
      );
      setFisioterapeutas(alunos);
    });

    api.get("/horario").then((res) => setHorarios(res.data));
  }, []);

  //Função para lidar com o clique na data
  function handleDateClick(arg: { date: Date }) {
    setNewEvent({ ...newEvent, start: arg.date, id: new Date().getTime() });
    setShowModal(true);
  }

  //Função para lidar com o envio do formulário
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
      status: "agendada",
    };

    try {
      const response = await api.post("/consulta", novaConsulta);
      setConsulta([...consulta, response.data]);
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <NavBar />
      <TopBar title="Disponibilidade" />

      <main className="flex flex-col items-center">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          events={events}
          dateClick={handleDateClick}
          locale={esLocale}
        />

        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <div className="fixed inset-0 bg-black/30" />

            <div className="fixed inset-0 flex items-center justify-center">
              <Dialog.Panel className="bg-white p-6 rounded">
                <form onSubmit={handleSubmit}>

                  <Select
                    value={newEvent.paciente_id ?? ""}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        paciente_id: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Selecione o paciente</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome_completo}
                      </option>
                    ))}
                  </Select>

                  {/* 🔥 AGORA MOSTRA APENAS ALUNOS */}
                  <Select
                    value={newEvent.fisioterapeuta_id ?? ""}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        fisioterapeuta_id: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Selecione o Usuário</option>
                    {fisioterapeutas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome_completo}
                      </option>
                    ))}
                  </Select>

                  <Select
                    value={newEvent.horario_id ?? ""}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        horario_id: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Selecione o horário</option>
                    {horarios.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.horario}
                      </option>
                    ))}
                  </Select>

                  <button type="submit">Criar</button>

                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition.Root>
      </main>
    </>
  );
}