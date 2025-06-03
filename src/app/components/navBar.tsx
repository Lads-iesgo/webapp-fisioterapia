"use client";

//Importações necessárias
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { useNotification } from "./Notification";

//Componente NavBar que representa a barra de navegação lateral
export default function NavBar() {
  const router = useRouter();
  const cookies = useCookies();
  const { showNotification } = useNotification();

  // Função para fazer logout
  const handleLogout = () => {
    // Remover o token do cookie
    cookies.remove("token");

    // Mostrar notificação de sucesso
    showNotification("success", "Logout realizado com sucesso!");

    // Redirecionar para a página de login
    router.push("/login");
  };

  return (
    <div className="bg-blue-900 fixed left-0 top-0 w-72 h-screen overflow-y-auto z-10">
      <div className="flex flex-col h-full">
        {/* Logo e título no topo */}
        <div className="flex flex-col items-center py-8">
          <Image
            src="/logo-iesgo.png"
            width={120}
            height={45}
            alt="Logo IESGO"
            className="mb-2"
          />
          <h2 className="text-white text-xl font-semibold tracking-wide">
            FISIOTERAPIA
          </h2>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/home"
                className="flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-lg">Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/disponibilidade"
                className="flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-lg">Disponibilidade</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cadastroPaciente"
                className="flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-lg">Cadastro de Paciente</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cadastroUsuario"
                className="flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-lg">Cadastro de Usuário</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cadastroConsulta"
                className="flex items-center text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-lg">Cadastro de Consulta</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Botão de logout no final da barra */}
        <div className="px-4 py-6 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-gray-200 hover:bg-blue-800 rounded-lg px-4 py-3 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-lg font-medium">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
