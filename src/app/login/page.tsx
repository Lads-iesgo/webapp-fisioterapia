"use client";

import { useCookies } from 'next-client-cookies'; // Alterar esta importação
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/button";
import api from "../services/api";
import { useNotification } from "../components/Notification";

import logo from "../../../public/logo-iesgo.png";

export default function Login() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const cookies = useCookies(); // Usar hook em vez de factory function
  
  const [credentials, setCredentials] = useState({
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", credentials);
      
      // Armazenar o token no cookies
      cookies.set('token', response.data.token, { 
        expires: 1, // expira em 1 dias
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Salvar informações do usuário no localStorage
      if (response.data.user) {
        localStorage.setItem("userData", JSON.stringify({
          email: response.data.user.email,
          nome: response.data.user.nome,
          perfil: response.data.user.perfil
        }));
      }
      
      // Armazenar flag indicando login bem-sucedido para a Home mostrar notificação
      sessionStorage.setItem("loginSuccess", "true");
      
      // Redireciona para a página home sem mostrar notificação aqui
      router.push("/home");
    } catch (error: unknown) {
        // Continua mostrando notificação de erro aqui
        let errorMessage = "Não foi possível fazer login. Verifique suas credenciais.";
      
        if (error && typeof error === "object" && "response" in error) {
          // @ts-expect-error
          errorMessage = error.response?.data?.message || errorMessage;
        }
      
        showNotification("error", errorMessage); // <-- não esqueça essa linha!
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[20px] shadow-lg">
        {/* Header azul escuro */}
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
        
        {/* Formulário de login */}
        <div className="bg-white p-8 border border-gray-200 rounded-b-[20px]">
          <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">
            Login
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Email */}
            <div>
              <label className="block text-base font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                placeholder="email@exemplo.com"
                onChange={handleChange}
                className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                required
              />
            </div>
            
            {/* Campo de Senha */}
            <div>
              <label className="block text-base font-medium mb-1">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                value={credentials.senha}
                placeholder="Digite sua senha"
                onChange={handleChange}
                className="border border-gray-300 rounded-[5px] px-3 py-2 w-full text-black"
                required
              />
            </div>
            
            {/* Link para recuperação de senha */}
            <div className="text-right">
              <Link href="/recuperar-senha" className="text-blue-600 text-sm hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            
            {/* Botão de login */}
            <Button
              text={loading ? "Entrando..." : "Entrar"}
              onClick={() => {}}
              variant="primary"
              type="submit"
              className="w-full"
            />
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} IESGO - Clínica de Fisioterapia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
