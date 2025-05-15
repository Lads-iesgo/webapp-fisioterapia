"use client";

import { useState } from "react";
import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import Button from "../components/button";
import api from "../services/api";

export default function CadastrarPaciente() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    telefone: "",
    email: "",
    data_nascimento: "",
    endereco: "",
    numero: "",
    bairro: "",
    cep: "",
    cidade: "",
    genero: "nao_informar",
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  // Função para formatação automática de CPF enquanto digita
  function formatarCPF(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const cpfLimitado = apenasNumeros.slice(0, 11);
    let cpfFormatado = "";

    if (cpfLimitado.length <= 3) {
      cpfFormatado = cpfLimitado;
    } else if (cpfLimitado.length <= 6) {
      cpfFormatado = `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3)}`;
    } else if (cpfLimitado.length <= 9) {
      cpfFormatado = `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6)}`;
    } else {
      cpfFormatado = `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6, 9)}-${cpfLimitado.slice(9)}`;
    }

    return cpfFormatado;
  }

  // Função para formatação automática de data enquanto digita
  function formatarDataNascimento(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const dataLimitada = apenasNumeros.slice(0, 8);
    let dataFormatada = "";

    if (dataLimitada.length <= 2) {
      dataFormatada = dataLimitada;
    } else if (dataLimitada.length <= 4) {
      dataFormatada = `${dataLimitada.slice(0, 2)}/${dataLimitada.slice(2)}`;
    } else {
      dataFormatada = `${dataLimitada.slice(0, 2)}/${dataLimitada.slice(2, 4)}/${dataLimitada.slice(4)}`;
    }

    return dataFormatada;
  }

  // Função para formatação automática de telefone enquanto digita
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

  // Função para formatação automática de CEP enquanto digita
  function formatarCEP(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const cepLimitado = apenasNumeros.slice(0, 8);
    let cepFormatado = "";

    if (cepLimitado.length <= 5) {
      cepFormatado = cepLimitado;
    } else {
      cepFormatado = `${cepLimitado.slice(0, 5)}-${cepLimitado.slice(5)}`;
    }

    return cepFormatado;
  }

  // Manipulador de alteração com formatação automática
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === "cpf") {
      setForm({ ...form, [name]: formatarCPF(value) });
    } else if (name === "data_nascimento") {
      setForm({ ...form, [name]: formatarDataNascimento(value) });
    } else if (name === "telefone") {
      setForm({ ...form, [name]: formatarTelefone(value) });
    } else if (name === "cep") {
      setForm({ ...form, [name]: formatarCEP(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function formatarDataParaAPI(dataStr: string) {
    if (dataStr.includes("-")) return dataStr;

    const [dia, mes, ano] = dataStr.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

    try {
      const dadosPaciente = {
        nome_completo: `${form.nome} ${form.sobrenome}`,
        email: form.email,
        telefone: form.telefone,
        genero: form.genero,
        data_nascimento: formatarDataParaAPI(form.data_nascimento),
        cpf: form.cpf,
        cep: form.cep,
        endereco: `${form.endereco}, ${form.numero}, ${form.bairro}, ${form.cidade}`,
      };

      const response = await api.post("/paciente", dadosPaciente);

      setForm({
        nome: "",
        sobrenome: "",
        cpf: "",
        telefone: "",
        email: "",
        data_nascimento: "",
        endereco: "",
        numero: "",
        bairro: "",
        cep: "",
        cidade: "",
        genero: "nao_informar",
      });

      setMensagem({
        tipo: "sucesso",
        texto: `Paciente cadastrado com sucesso! Nome: ${dadosPaciente.nome_completo}, CPF: ${dadosPaciente.cpf}`,
      });
    } catch (error: any) {
      setMensagem({
        tipo: "erro",
        texto: error?.response?.data?.message || "Erro ao cadastrar paciente. Verifique os dados e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <div className="ml-72">
        <TopBar title="Cadastrar Paciente" />
        <main className="pt-24 px-4 md:px-8 pb-8">
          <div className="max-w-4xl mx-auto overflow-hidden rounded-[20px] shadow-lg">
            <div className="bg-blue-900 h-12 w-full"></div>
            <form
              onSubmit={handleSubmit}
              className="border border-gray-200 bg-white px-4 sm:px-6 md:px-8 py-6 rounded-b-[20px]"
            >
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    placeholder="Digite o nome"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Sobrenome</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={form.sobrenome}
                    placeholder="Digite o sobrenome"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full sm:w-1/2 md:w-1/6">
                  <label className="block text-base font-medium mb-1">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    placeholder="123.456.789-00"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/6">
                  <label className="block text-base font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={form.telefone}
                    placeholder="(11) 98765-4321"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <label className="block text-base font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="email@exemplo.com"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/4">
                  <label className="block text-base font-medium mb-1">Data de nascimento</label>
                  <input
                    type="text"
                    name="data_nascimento"
                    value={form.data_nascimento}
                    placeholder="DD/MM/AAAA"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-3/5">
                  <label className="block text-base font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    name="endereco"
                    value={form.endereco}
                    placeholder="Nome da rua, avenida, etc."
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/5">
                  <label className="block text-base font-medium mb-1">sexo</label>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black appearance-none"
                    required
                  >
                    <option value="nao_informar">Não quero informar</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/2 md:w-1/5">
                  <label className="block text-base font-medium mb-1">Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={form.numero}
                    placeholder="123"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full sm:w-1/3">
                  <label className="block text-base font-medium mb-1">Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    value={form.bairro}
                    placeholder="Centro"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <label className="block text-base font-medium mb-1">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={form.cep}
                    placeholder="00000-000"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <label className="block text-base font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={form.cidade}
                    placeholder="São Paulo"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              {mensagem && (
                <div
                  className={`text-center font-semibold rounded-[5px] p-3 mt-4 ${
                    mensagem.tipo === "sucesso"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {mensagem.texto}
                </div>
              )}
              <div className="flex justify-end mt-6">
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