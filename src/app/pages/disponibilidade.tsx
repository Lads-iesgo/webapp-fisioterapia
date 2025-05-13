"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// import NavBar from "../components/navBar";
// import TopBar from "../components/topBar";

export default function Disponibilidade() {
  return (
    <>
      {/* <NavBar />
      <TopBar title="Disponibilidade" /> */}

      <main className="flex flex-col min-h-screen justify-center items-center p-24">
        <div className="grid grid-cols-10">
          <div className="col-span-18">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "resourceTimelineWook, dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={{}}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
              // dateClick={{}}
              // drop={}
              // eventClick={}
            />
          </div>
        </div>
      </main>
    </>
  );
}
