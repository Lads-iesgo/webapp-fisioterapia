"use client";

import api from "@/app/services/api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/pt-br";
import { EventInput } from "@fullcalendar/core";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition, Select } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

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
  //const [todasConsultas, setTodasConsultas] = useState<Consulta[]>([]);
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

    try {
      const response = await api.post("/consulta", novaConsulta);
      console.log("Consulta salva:", response.data);

      // Atualiza o estado com a nova consulta retornada pela API
      setConsulta([...consulta, response.data]);

      // Fecha o modal após salvar
      handleCloseModal();

      // Opcional: Exibir mensagem de sucesso
      alert("Consulta agendada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar consulta:", error);
      alert(
        "Erro ao agendar consulta. Verifique o console para mais detalhes."
      );
    }
  };

  function handleDeleteModal(data: { event: { id: string } }) {
    setShowDeleteModal(true);
    setIdToDelete(Number(data.event.id));
  }

  async function handleDelete() {
    if (!idToDelete) {
      alert("Não foi possível identificar a consulta para exclusão.");
      return;
    }

    try {
      // Chamada para a API para excluir a consulta
      await api.delete(`/consulta/${idToDelete}`);

      // Atualiza o estado local removendo a consulta excluída
      setConsulta(consulta.filter((item) => Number(item.id) !== idToDelete));

      // Fecha o modal e reseta o estado
      setShowDeleteModal(false);
      setIdToDelete(null);

      // Feedback para o usuário
      alert("Consulta excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir consulta:", error);
      alert(
        "Erro ao excluir consulta. Verifique o console para mais detalhes."
      );
    }
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
        },
      };
    });
    setEvents(eventos);
  }, [consulta, pacientes, fisioterapeutas, horarios]);

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
              editable={true}
              selectable={true}
              selectMirror={true}
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
              slotMinTime="14:00:00"
              slotMaxTime="17:00:00"
              allDaySlot={false}
              scrollTime="08:00:00"
            />
          </div>
        </div>

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setShowDeleteModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div
                          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Delete Event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Deseja excluir está consulta?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDelete}
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-6 pb-6 pt-5 text-left shadow-xl transition-all w-auto">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Adicionar Consulta
                        </Dialog.Title>
                        <form
                          onSubmit={handleSubmit}
                          className="grid grid-cols-3"
                        >
                          <Select
                            value={newEvent.paciente_id ?? ""}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                paciente_id: Number(e.target.value),
                              })
                            }
                            required
                            className="justify-self-start"
                          >
                            <option value="">Selecione o paciente</option>
                            {pacientes.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nome_completo}
                              </option>
                            ))}
                          </Select>

                          <Select
                            value={newEvent.fisioterapeuta_id ?? ""}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                fisioterapeuta_id: Number(e.target.value),
                              })
                            }
                            required
                            className="justify-self-start"
                          >
                            <option value="">Selecione o fisioterapeuta</option>
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
                            required
                            className="justify-self-start"
                          >
                            <option value="">Selecione o horário</option>
                            {horarios.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.horario}
                              </option>
                            ))}
                          </Select>

                          {/* outros campos, como data, status, etc */}
                          <button type="submit" className="col-start-2">
                            Criar
                          </button>
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
    </>
  );
}
