"use client";

import api from "@/app/services/api";

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
  const [eventToDelete, setEventToDelete] = useState<{
    id: number | null;
    pacienteNome?: string;
    fisioterapeutaNome?: string;
    horario?: string;
  } | null>(null);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  // Adicione esses estados ao início do componente
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    show: boolean;
  }>({
    type: "success",
    message: "",
    show: false,
  });

  function showNotification(
    type: "success" | "error" | "warning",
    message: string
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

    // Valida todos os campos antes de enviar
    const pacienteError = validateField("paciente_id", newEvent.paciente_id);
    const fisioterapeutaError = validateField(
      "fisioterapeuta_id",
      newEvent.fisioterapeuta_id
    );
    const horarioError = validateField("horario_id", newEvent.horario_id);

    if (pacienteError || fisioterapeutaError || horarioError) {
      setFormErrors({
        paciente_id: pacienteError,
        fisioterapeuta_id: fisioterapeutaError,
        horario_id: horarioError,
      });
      showNotification(
        "warning",
        "Por favor, preencha todos os campos obrigatórios."
      );
      return;
    }

    try {
      const response = await api.post("/consulta", novaConsulta);
      console.log("Consulta salva:", response.data);

      // Atualiza o estado com a nova consulta retornada pela API
      setConsulta([...consulta, response.data]);

      // Fecha o modal após salvar
      handleCloseModal();

      // Notificação de sucesso
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

  function handleDeleteModal(data: EventClickArg) {
    setShowDeleteModal(true);
    setEventToDelete({
      id: Number(data.event.id),
      pacienteNome: data.event.extendedProps?.pacienteNome,
      fisioterapeutaNome: data.event.extendedProps?.fisioterapeutaNome,
      horario: data.event.extendedProps?.horario,
    });
  }

  async function handleDelete() {
    if (!eventToDelete || !eventToDelete.id) {
      showNotification(
        "error",
        "Não foi possível identificar a consulta para exclusão."
      );
      return;
    }

    try {
      // Chamada para a API para excluir a consulta
      await api.delete(`/consulta/${eventToDelete.id}`);

      // Atualiza o estado local removendo a consulta excluída
      setConsulta(
        consulta.filter((item) => Number(item.id) !== eventToDelete.id)
      );

      // Fecha o modal e reseta o estado
      setShowDeleteModal(false);
      setEventToDelete(null);

      // Feedback para o usuário
      showNotification(
        "success",
        `Consulta de ${eventToDelete.pacienteNome} excluída com sucesso!`
      );
    } catch (error) {
      console.error("Erro ao excluir consulta:", error);
      showNotification(
        "error",
        "Erro ao excluir consulta. Tente novamente mais tarde."
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
    setEventToDelete(null);
  }

  // Adicione este estado
  const [formErrors, setFormErrors] = useState({
    paciente_id: "",
    fisioterapeuta_id: "",
    horario_id: "",
  });

  // Função de validação
  function validateField(
    field: string,
    value: string | number | null | undefined
  ): string {
    if (!value && value !== 0) {
      // Permitir o valor 0 como válido para campos numéricos
      return `Este campo é obrigatório`;
    }
    return "";
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
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {notification.type === "success" ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : notification.type === "error" ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
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
                <span className="sr-only">Fechar</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

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
                    <p><strong>Status:</strong> ${
                      info.event.extendedProps.status || "Não informado"
                    }</p>
                  </div>
                `;
                tooltip.style.position = "absolute";
                tooltip.style.zIndex = "10000";
                tooltip.style.display = "none";

                document.body.appendChild(tooltip);

                // Mostra o tooltip no hover
                info.el.addEventListener("mouseenter", () => {
                  const rect = info.el.getBoundingClientRect();
                  tooltip.style.left = rect.right + 5 + "px";
                  tooltip.style.top = rect.top + "px";
                  tooltip.style.display = "block";
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
              <div className="fixed inset-0 backdrop-blur-xs transition-opacity" />
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
                            Excluir Consulta
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Deseja excluir a consulta de{" "}
                              <strong>
                                {eventToDelete?.pacienteNome ||
                                  "paciente não identificado"}
                              </strong>{" "}
                              com{" "}
                              <strong>
                                {eventToDelete?.fisioterapeutaNome}
                              </strong>{" "}
                              às <strong>{eventToDelete?.horario}</strong>?
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
              <div className="fixed inset-0 backdrop-blur-xs transition-opacity" />
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
                          className="mt-4 flex flex-col space-y-4 w-full"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Paciente
                              </label>
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
                                      value
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
                                <option value="">Selecione o paciente</option>
                                {pacientes.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nome_completo}
                                  </option>
                                ))}
                              </Select>
                              {formErrors.paciente_id && (
                                <p className="mt-1 text-sm text-red-600">
                                  {formErrors.paciente_id}
                                </p>
                              )}
                            </div>
                            {/* Para o campo de fisioterapeuta */}
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fisioterapeuta
                              </label>
                              <Select
                                value={newEvent.fisioterapeuta_id ?? ""}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  setNewEvent({
                                    ...newEvent,
                                    fisioterapeuta_id: value,
                                  });
                                  setFormErrors({
                                    ...formErrors,
                                    fisioterapeuta_id: validateField(
                                      "fisioterapeuta_id",
                                      value
                                    ),
                                  });
                                }}
                                required
                                className={`w-full rounded-md border ${
                                  formErrors.fisioterapeuta_id
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } px-4 py-3 text-base select-custom`}
                              >
                                <option value="">
                                  Selecione o fisioterapeuta
                                </option>
                                {fisioterapeutas.map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.nome_completo}
                                  </option>
                                ))}
                              </Select>
                              {formErrors.fisioterapeuta_id && (
                                <p className="mt-1 text-sm text-red-600">
                                  {formErrors.fisioterapeuta_id}
                                </p>
                              )}
                            </div>
                            {/* Para o campo de horário */}
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                      value
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
                                <option value="">Selecione o horário</option>
                                {horarios.map((h) => (
                                  <option key={h.id} value={h.id}>
                                    {h.horario}
                                  </option>
                                ))}
                              </Select>
                              {formErrors.horario_id && (
                                <p className="mt-1 text-sm text-red-600">
                                  {formErrors.horario_id}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex justify-center space-x-4">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md bg-gray-300 px-5 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-400"
                              onClick={() => setShowModal(false)}
                            >
                              Voltar
                            </button>
                            <button
                              type="submit"
                              className="inline-flex justify-center rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
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
    </>
  );
}
