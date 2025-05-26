"use client";

import { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import TopBar from "../components/topBar";
import Button from "../components/button";
import api from "../services/api";

// Interface para o tipo de perfil
interface Perfil {
  id: number;
  nome: string;
}

export default function CadastroUsuario() {
  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    senha: "",
    telefone: "",
    cpf: "",
    semestre: "",
    perfil_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingPerfis, setLoadingPerfis] = useState(true);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [mensagem, setMensagem] = useState<{
    tipo: "erro" | "sucesso";
    texto: string;
  } | null>(null);

  // Buscar perfis da API quando o componente for montado
  useEffect(() => {
    async function buscarPerfis() {
      try {
        setLoadingPerfis(true);
        const response = await api.get('/perfil');
        setPerfis(response.data);
        
        // Se houver perfis, seleciona o primeiro por padrão
        if (response.data && response.data.length > 0) {
          setForm(prevForm => ({
            ...prevForm,
            perfil_id: response.data[0].id
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar perfis:", error);
        setMensagem({
          tipo: "erro",
          texto: "Não foi possível carregar os perfis. Por favor, tente novamente."
        });
      } finally {
        setLoadingPerfis(false);
      }
    }

    buscarPerfis();
  }, []);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    if (name === "telefone") {
      setForm({ ...form, [name]: formatarTelefone(value) });
    } else if (name === "cpf") {
      setForm({ ...form, [name]: formatarCPF(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);
    
    try {
      // Preparar dados para API conforme userController.ts
      const dadosUsuario = {
        nome_completo: form.nome_completo,
        email: form.email,
        senha: form.senha,
        telefone: form.telefone,
        cpf: form.cpf,
        semestre: form.semestre,
        perfil_id: Number(form.perfil_id) // Convertendo para número, pois pode vir como string do select
      };

      // Fazer requisição POST para /usuario
      const response = await api.post("/usuario", dadosUsuario);
      
      // Limpar formulário após sucesso
      setForm({
        nome_completo: "",
        email: "",
        senha: "",
        telefone: "",
        cpf: "",
        semestre: "",
        perfil_id: perfis.length > 0 ? String(perfis[0].id) : "", // Reset para o primeiro perfil
      });
      
      // Mostrar mensagem de sucesso
      setMensagem({ 
        tipo: "sucesso", 
        texto: `Usuário cadastrado com sucesso! Nome: ${dadosUsuario.nome_completo}, Email: ${dadosUsuario.email}` 
      });
    } catch (error: any) {
      // Mostrar mensagem de erro
      setMensagem({
        tipo: "erro",
        texto: error?.response?.data?.message || "Erro ao cadastrar usuário. Verifique os dados e tente novamente."
      });
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
                <div className="w-full">
                  <label className="block text-base font-medium mb-1">Nome Completo</label>
                  <input
                    type="text"
                    name="nome_completo"
                    value={form.nome_completo}
                    placeholder="João Silva Pereira"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="joao.pereira@email.com"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-base font-medium mb-1">Senha</label>
                  <input
                    type="password"
                    name="senha"
                    value={form.senha}
                    placeholder="Digite sua senha"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/3">
                  <label className="block text-base font-medium mb-1">Semestre</label>
                  <select
                    name="semestre"
                    value={form.semestre}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione o semestre</option>
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
                <div className="w-full md:w-1/3">
                  <label className="block text-base font-medium mb-1">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    placeholder="123.456.789-00"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-base font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={form.telefone}
                    placeholder="(11) 98765-4321"
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-full text-black"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full">
                  <label className="block text-base font-medium mb-1">Perfil</label>
                  {loadingPerfis ? (
                    <div className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100">
                      Carregando perfis...
                    </div>
                  ) : (
                    <select
                      name="perfil_id"
                      value={form.perfil_id}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 w-full text-black appearance-none"
                      required
                    >
                      <option value="" disabled>Selecione o perfil</option>
                      {perfis.map(perfil => (
                        <option key={perfil.id} value={perfil.id}>
                          {perfil.nome}
                        </option>
                      ))}
                    </select>
                  )}
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
                  disabled={loadingPerfis || loading}
                />
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}