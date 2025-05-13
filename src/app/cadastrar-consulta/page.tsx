"use client";

import { useState } from "react";
import NavBar from "../components/navBar"; // Importar NavBar
import TopBar from "../components/topBar";
import Button from "../components/button"; // Importar o componente Button

const pacientes = ["Ana Silva", "João Souza", "Maria Oliveira"]; // Substitua por dados reais do sistema
const fisioterapeutas = ["Dr. Pedro", "Dra. Carla"]; // Substitua por dados reais do sistema

export default function Appointment() {
  const [paciente, setPaciente] = useState("");
  const [fisioterapeuta, setFisioterapeuta] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para salvar a consulta
    alert("Consulta cadastrada com sucesso!");
  }

  function handleVoltar() {
    window.history.back();
  }

  return (
    <div className="bg-white h-screen flex flex-row overflow-hidden">
      <NavBar />
      <div className="flex flex-col flex-1">
        <TopBar title="Cadastrar Consulta" />
        
        <main className="flex flex-1 items-center justify-center p-4 overflow-y-auto "> {/* adc class bg-gray-100  para fundo do formulario*/}
          <div className="bg-white p-8 w-full max-w-lg mt-8"> {/* Contêiner do formulário com espaçamento superior */}
            <form onSubmit={handleSalvar} className="flex flex-col gap-6">
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">Paciente</span>
                <select
                  required
                  value={paciente}
                  onChange={e => setPaciente(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="" disabled>Selecione o paciente</option>
                  {pacientes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">Fisioterapeuta</span>
                <select
                  required
                  value={fisioterapeuta}
                  onChange={e => setFisioterapeuta(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="" disabled>Selecione o fisioterapeuta</option>
                  {fisioterapeutas.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">Data</span>
                <input
                  required
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">Horário</span>
                <input
                  required
                  type="time"
                  value={horario}
                  onChange={e => setHorario(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </label>
              <div className="flex justify-between mt-8">
                <Button
                  text="Voltar"
                  onClick={handleVoltar}
                  variant="secondary"
                  type="button"
                />
                <Button
                  text="Salvar"
                  onClick={(e) => { /* A função onClick é opcional aqui se type="submit" já chama handleSalvar */ }}
                  variant="primary"
                  type="submit" // Garante que o formulário seja submetido
                />
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}