"use client";

import { useEffect, useState } from "react";
import NavBar from "../components/navBar"; // Importa de src/app/components/navBar.tsx
import TopBar from "../components/topBar"; // Importa de src/app/components/topBar.tsx
import Button from "../components/button"; // Importa de src/app/components/button.tsx
import api from "../services/api";

interface Paciente {
  id: number;
  nome_completo: string;
}

interface Fisioterapeuta {
  id: number;
  nome_completo: string;
}

interface Horario {
  id: number;
  horario: string;
}

export default function PaginaCadastrarConsulta() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [paciente, setPaciente] = useState("");
  const [fisioterapeuta, setFisioterapeuta] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "erro" | "sucesso";
    texto: string;
  } | null>(null);

  useEffect(() => {
    api.get<Paciente[]>("/paciente").then((res) => setPacientes(res.data));
    api
      .get<Fisioterapeuta[]>("/usuario/fisioterapeutas")
      .then((res) => setFisioterapeutas(res.data));
    api.get<Horario[]>("/horario").then((res) => setHorarios(res.data));
  }, []);

  function getNomePaciente(id: string) {
    return pacientes.find((p) => p.id === Number(id))?.nome_completo || "";
  }
  function getNomeFisioterapeuta(id: string) {
    return (
      fisioterapeutas.find((f) => f.id === Number(id))?.nome_completo || ""
    );
  }
  function getHorarioTexto(id: string) {
    return (
      horarios.find((h) => h.id === Number(id))?.horario?.slice(0, 5) || ""
    );
  }
  function formatarData(dataISO: string) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

    try {
      await api.post("/consulta", {
        paciente_id: Number(paciente),
        fisioterapeuta_id: Number(fisioterapeuta),
        data_consulta: data,
        horario_id: Number(horario),
      });
      setMensagem({
        tipo: "sucesso",
        texto: `Consulta cadastrada com sucesso!
        Paciente: ${getNomePaciente(paciente)}
        Fisioterapeuta: ${getNomeFisioterapeuta(fisioterapeuta)}
        Data: ${formatarData(data)}
        Horário: ${getHorarioTexto(horario)}`,
      });
      setPaciente("");
      setFisioterapeuta("");
      setData("");
      setHorario("");
    } catch (error: any) {
      setMensagem({
        tipo: "erro",
        texto: error?.response?.data?.message || "Erro ao cadastrar consulta.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleVoltar() {
    window.history.back();
  }

  return (
    <div className="bg-white h-screen flex flex-row overflow-hidden ml-[288px]">
      <NavBar />
      <div className="flex flex-col flex-1">
        <TopBar title="Cadastrar Consulta" />
        <main className="flex flex-1 items-center justify-center p-4 overflow-y-auto bg-gray-100">
          <div className="bg-white p-8 w-full max-w-lg mt-24 rounded-lg shadow-sm">
            <form onSubmit={handleSalvar} className="flex flex-col gap-6">
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">
                  Paciente
                </span>
                <select
                  required
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="" disabled>
                    Selecione o paciente
                  </option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome_completo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">
                  Fisioterapeuta
                </span>
                <select
                  required
                  value={fisioterapeuta}
                  onChange={(e) => setFisioterapeuta(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="" disabled>
                    Selecione o fisioterapeuta
                  </option>
                  {fisioterapeutas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome_completo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">Data</span>
                <input
                  required
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-blue-900 font-semibold mb-2">
                  Horário
                </span>
                <select
                  required
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="" disabled>
                    Selecione o horário
                  </option>
                  {horarios.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.horario.slice(0, 5)}
                    </option>
                  ))}
                </select>
              </label>
              {mensagem && (
                <div
                  className={`whitespace-pre-line text-center font-semibold rounded p-3 mt-2 ${
                    mensagem.tipo === "sucesso"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {mensagem.texto}
                </div>
              )}
              <div className="flex justify-between mt-8">
                <Button
                  text="Voltar"
                  onClick={handleVoltar}
                  variant="secondary"
                  type="button"
                />
                <Button
                  text={loading ? "Salvando..." : "Salvar"}
                  onClick={() => {}}
                  variant="primary"
                  type="submit"
                />
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
