"use client";

import Image from "next/image";
import Link from "next/link";

import logo from "../../../public/logo-iesgo.png";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 h-full w-72 bg-linear-to-r from-blue-950 to-blue-900 py-6 flex flex-col">
      <div className="mt-6 mb-16 py-6 pl-10 w-60 flex justify-center items-center">
        <Image src={logo} alt="Logo Instituição IESGO"></Image>
      </div>
      <ul className="flex flex-col pl-10 gap-4 content-center">
        <li className="py-2">
          <Link
            href="/home"
            className="text-white hover:text-gray-300 hover:cursor-pointer"
          >
            Home
          </Link>
        </li>
        <li className="py-2">
          <Link
            href="/cadastroUsuario"
            className="text-white hover:text-gray-300 hover:cursor-pointer"
          >
            Cadastro de Usuário
          </Link>
        </li>
        <li className="py-2">
          <Link
            href="/cadastroPaciente"
            className="text-white hover:text-gray-300 hover:cursor-pointer"
          >
            Cadastro de Paciente
          </Link>
        </li>
        <li className="py-2">
          <Link
            href="/cadastroConsulta"
            className="text-white hover:text-gray-300 hover:cursor-pointer"
          >
            Cadastro de Consulta
          </Link>
        </li>
        {/* <li className="py-2">
          <Link
            href="/consultarPaciente"
            className="text-white hover:text-gray-300 hover:cursor-pointer"
          >
            Consultar Paciente
          </Link>
        </li> */}
        <li className="py-2">
          <Link
            href="/disponibilidade"
            className="text-white hover:text-gray-300 hover:cursor-pointer"
          >
            Cadastrar Disponibilidade
          </Link>
        </li>

      </ul>
    </nav>
  );
}
