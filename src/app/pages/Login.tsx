"use client";

import { useState } from "react";
import NavBar from "../components/navBar";
import TopBar from "../components/topBar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Senha:", senha);
    // Aqui você pode implementar a chamada para sua API de autenticação
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <NavBar />

      {/* Área principal */}
      <div className="flex flex-col flex-grow">
        {/* Barra superior */}
        <TopBar title="Login" />

        {/* Conteúdo centralizado */}
        <div className="flex flex-grow items-center justify-center p-4">
          <form
            onSubmit={handleLogin}
            className="bg-white shadow-md border rounded-xl w-full max-w-md"
          >
            {/* Cabeçalho visual */}
            <div className="bg-blue-950 w-full h-16 rounded-t-xl mb-6 " />

            <label className="block text-xl font-semibold mb-2 text-gray-950 text-center" >Login</label>
            <div className="w-4/5 mx-auto">
              <input
                type="email"
                className="w-full px-4 py-2 border rounded mb-4 text-gray-700"
                placeholder="algumacoisa@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="block text-xl font-semibold mb-2 text-gray-950 text-center">Senha</label>
            <div className="w-4/5 mx-auto">
            <input
                type="password"
                className="w-full px-4 py-2 border rounded mb-6 text-gray-700"
                placeholder="algumacoisa123"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <div className="w-2/5 mx-auto pb-4">
              <button
                type="submit"
                className="w-full bg-blue-950 text-white font-semibold py-2 rounded hover:bg-blue-800"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
