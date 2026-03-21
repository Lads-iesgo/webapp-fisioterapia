"use client";

//Importações necessárias

import { useState } from "react";
import { AxiosError } from "axios";

import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import Button from "../components/button";
import api from "../services/api";

export default function CadastrarPaciente() {
  //Estado para armazenar os dados do formulário
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
  const [mensagem, setMensagem] = useState<{
    tipo: "erro" | "sucesso";
    texto: string;
  } | null>(null);

  //Função para formatação automática de CPF enquanto digita
  function formatarCPF(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const cpfLimitado = apenasNumeros.slice(0, 11);
    let cpfFormatado = "";

    if (cpfLimitado.length <= 3) {
      cpfFormatado = cpfLimitado;
    } else if (cpfLimitado.length <= 6) {
      cpfFormatado = `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3)}`;
    } else if (cpfLimitado.length <= 9) {
      cpfFormatado = `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(
        3,
        6
      )}.${cpfLimitado.slice(6)}`;
    } else {
      cpfFormatado = `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(
        3,
        6
      )}.${cpfLimitado.slice(6, 9)}-${cpfLimitado.slice(9)}`;
    }

    return cpfFormatado;
  }

  //Função para formatação automática de data enquanto digita
  function formatarDataNascimento(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const dataLimitada = apenasNumeros.slice(0, 8);
    let dataFormatada = "";

    if (dataLimitada.length <= 2) {
      dataFormatada = dataLimitada;
    } else if (dataLimitada.length <= 4) {
      dataFormatada = `${dataLimitada.slice(0, 2)}/${dataLimitada.slice(2)}`;
    } else {
      dataFormatada = `${dataLimitada.slice(0, 2)}/${dataLimitada.slice(
        2,
        4
      )}/${dataLimitada.slice(4)}`;
    }

    return dataFormatada;
  }

  //Função para formatação automática de telefone enquanto digita
  function formatarTelefone(valor: string): string {
    const apenasNumeros = valor.replace(/\D/g, "");
    const telefoneLimitado = apenasNumeros.slice(0, 11);
    let telefoneFormatado = "";

    if (telefoneLimitado.length <= 2) {
      telefoneFormatado = `(${telefoneLimitado}`;
    } else if (telefoneLimitado.length <= 7) {
      telefoneFormatado = `(${telefoneLimitado.slice(
        0,
        2
      )}) ${telefoneLimitado.slice(2)}`;
    } else {
      telefoneFormatado = `(${telefoneLimitado.slice(
        0,
        2
      )}) ${telefoneLimitado.slice(2, 7)}-${telefoneLimitado.slice(7)}`;
    }

    return telefoneFormatado;
  }

  //Função para formatação automática de CEP enquanto digita
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

  //Manipulador de alteração com formatação automática
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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

  //Função para formatar a data para o formato esperado pela API (YYYY-MM-DD)
  function formatarDataParaAPI(dataStr: string) {
    if (dataStr.includes("-")) return dataStr;

    const [dia, mes, ano] = dataStr.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  //Função para lidar com o envio do formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

  
// Validação de CPF (garantir 11 números)
const cpfNumeros = form.cpf.replace(/\D/g, ""); // remove formatação

// Bloqueia envio se CPF não tiver 11 dígitos
if (cpfNumeros.length !== 11) {
  setMensagem({
    tipo: "erro",
    texto: "CPF deve conter exatamente 11 números.",
  });
  setLoading(false);
  return; // impede envio
}

    //Validação simples para verificar se o CPF já está preenchido
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

      await api.post("/paciente", dadosPaciente);

      //Limpar o formulário após o envio
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;

      setMensagem({
        tipo: "erro",
        texto:
          axiosError.response?.data?.message ||
          "Erro ao cadastrar paciente. Verifique os dados e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }}