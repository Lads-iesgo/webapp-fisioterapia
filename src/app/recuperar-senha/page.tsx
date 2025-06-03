"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/button";
import api from "../services/api";

// Importa a mesma logo usada na página de login
import logo from "../../../public/logo-iesgo.png";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: "erro" | "sucesso";
    texto: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

    try {
      await api.post("/recuperar-senha", { email });
      
      setMensagem({
        tipo: "sucesso",
        texto: "Enviamos um email com instruções para redefinir sua senha."
      });
      setEmail("");
    } catch (error: any) {
      setMensagem({
        tipo: "erro",
        texto: error?.response?.data?.message || "Não foi possível processar sua solicitação."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[20px] shadow-lg">
        {/* Header azul escuro - Mantendo o mesmo estilo da página de login */}
        <div className="bg-blue-900 p-6 flex flex-col items-center justify-center">
          <Image 
            src={logo} 
            width={160} 
            height={60} 
            priority 
            alt="Logo Instituição IESGO"
            className="mb-2"
          />
          <h2 className="text-white text-xl font-semibold tracking-wide">
            FISIOTERAPIA
          </h2>
        </div>
        
        {/* Formulário de recuperação de senha */}
        <div className="bg-white p-8 border border-gray-200 rounded-b-[20px]">
          <h1 className="text-2xl font-bold text-blue-900 mb-2 text-center">
            Recuperar Senha
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Digite seu email para receber instruções de recuperação de senha
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Email */}
            <div>
              <label className="block text-base font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                placeholder="email@exemplo.com"
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                required
              />
            </div>
            
            {/* Mensagem de erro ou sucesso */}
            {mensagem && (
              <div 
                className={`text-center font-semibold rounded-[5px] p-3 ${
                  mensagem.tipo === "sucesso"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {mensagem.texto}
              </div>
            )}
            
            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="w-full sm:w-1/2">
                <Button
                  text="Voltar"
                  onClick={() => {}}
                  variant="secondary"
                  type="button"
                  className="w-full"
                />
              </Link>
              <Button
                text={loading ? "Enviando..." : "Enviar"}
                onClick={() => {}}
                variant="primary"
                type="submit"
                className="w-full sm:w-1/2"
              />
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} IESGO - Clínica de Fisioterapia</p>
          </div>
        </div>
      </div>
    </div>
  );
}