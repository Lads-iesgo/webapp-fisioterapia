"use client";

import { useState } from "react";
import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import Button from "../components/button";

export default function CadastroUsuario() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    semestre: "",
    matricula: "",
    email: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "erro" | "sucesso";
    texto: string;
  } | null>(null);

  function formatarTelefone(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const telefoneLimitado = apenasNumeros.slice(0, 11);
    let telefoneFormatado = "";
    if (telefoneLimitado.length <= 2) {
      telefoneFormatado = `(${telefoneLimitado}`;
    } else if (telefoneLimitado.length <= 7) {
      telefoneFormatado = `(${telefoneLimitado.slice(0, 2)}) ${telefoneLimitado.slice(2)}`;
    } else {
      telefoneFormatado = `(${telefoneLimitado.slice(0, 2)}) ${telefoneLimitado.slice(2, 7)}-${telefoneLimitado.slice(7)}`;
    }
    return telefoneFormatado;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "telefone") {
      setForm({ ...form, [name]: formatarTelefone(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);
    try {
      // Aqui você pode integrar com a API
      setMensagem({ tipo: "sucesso", texto: "Usuário cadastrado com sucesso!" });
      setForm({ nome: "", sobrenome: "", semestre: "", matricula: "", email: "", telefone: "" });
    } catch (error: any) {
      setMensagem({ tipo: "erro", texto: "Erro ao cadastrar usuário. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  function handleVoltar() {
    window.history.back();
  }

  return (
    <div className="bg-white min-h-screen flex flex-row overflow-hidden ml-[288px]">
      <NavBar />
      <div className="flex flex-col flex-1">
        <TopBar title="Cadastro de usuário" />
        <main className="flex flex-1 items-center justify-center p-4 overflow-y-auto bg-gray-100">
          <div className="bg-white w-full max-w-2xl mt-24 rounded-lg shadow-sm border border-blue-200">
            <div className="bg-blue-900 h-10 w-full rounded-t-lg"></div>
            <form onSubmit={handleSubmit} className="px-8 py-8 rounded-b-lg">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    placeholder="Fulano"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Sobrenome</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={form.sobrenome}
                    placeholder="Fulano"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Semestre</label>
                  <select
                    name="semestre"
                    value={form.semestre}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione</option>
                    <option value="1º">1º</option>
                    <option value="2º">2º</option>
                    <option value="3º">3º</option>
                    <option value="4º">4º</option>
                    <option value="5º">5º</option>
                    <option value="6º">6º</option>
                    <option value="7º">7º</option>
                    <option value="8º">8º</option>
                  </select>
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="Example@gmail.com"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Matrícula</label>
                  <input
                    type="text"
                    name="matricula"
                    value={form.matricula}
                    placeholder="*****"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={form.telefone}
                    placeholder="(00) 00000-0000"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              {mensagem && (
                <div
                  className={`text-center font-semibold rounded p-3 mt-2 ${
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