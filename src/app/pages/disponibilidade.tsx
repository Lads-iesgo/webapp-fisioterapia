"use client";

import api from "@/app/services/api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/pt-br";
import { useEffect, useState } from "react";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";

import { Consulta } from "../interfaces/types";

export default function Disponibilidade() {
  const [consulta, setConsulta] = useState<Consulta[]>([]);

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
  return (
    <>
      <NavBar />
      <TopBar title="Disponibilidade" />

      <main className="flex flex-col min-h-screen justify-center items-center p-0">
        <div className="flex justify-center items-center w-full">
          <div className="ml-[288px] mt-64 absolute">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                start: "prev,next today",
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              slotDuration={"01:00"}
              events={{}}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
              locale={esLocale}
              initialView="timeGridWeek"
              businessHours={{
                start: "14:00",
                end: "16:00",
                daysOfWeek: [1, 2, 3, 4, 5], // Seg - Sex
              }}
              // dateClick={{}}
              // drop={}
              // eventClick={}
              aspectRatio={1.1}
              contentHeight={600}
            />
          </div>
        </div>
      </main>
    </>
  );
}
