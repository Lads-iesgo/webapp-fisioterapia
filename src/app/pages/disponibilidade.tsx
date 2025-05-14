"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/pt-br";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";

export default function Disponibilidade() {
  return (
    <>
      <NavBar />
      <TopBar title="Disponibilidade" />

      <main className="flex flex-col min-h-screen justify-center items-center p-0">
        <div className="flex justify-center items-center w-full">
          <div className="ml-[288px] mt-28 absolute">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                start: "prev,next today",
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={{}}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
              locale={esLocale}
              // dateClick={{}}
              // drop={}
              // eventClick={}
              aspectRatio={1.1}
              contentHeight={500}
            />
          </div>
        </div>
      </main>
    </>
  );
}
