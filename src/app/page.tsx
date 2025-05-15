"use client";

import NavBar from "./components/navBar";
import TopBar from "./components/topBar";

export default function CadastrarPaciente() {
  return (
    <div className="bg-white ">
      {/* Sidebar */}
      <NavBar />

      {/* Área principal */}
      <div className="flex flex-col flex-grow ml-[288px] mt-11">
        {/* Topbar */}
        <TopBar title="Cadastrar Paciente" />

        {/* Conteúdo centralizado horizontalmente */}
        <div className="flex justify-center p-6">
          <div className="bg-white border rounded-xl shadow-md w-full max-w-4xl">
            {/* Cabeçalho visual */}
            <div className="bg-blue-950 h-13 rounded-t-xl" />

            {/* Formulário */}
            <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-950">Nome Completo</label>
                <input type="text" placeholder="Fulano" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              <div>
                <label className="block font-semibold text-gray-950">Data de Nascimento</label>
                <input type="text" placeholder="00/00/0000" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              <div>
                <label className="block font-semibold text-gray-950">E-mail</label>
                <input type="email" placeholder="example@email.com" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              <div>
                <label className="block font-semibold text-gray-950">Sexo</label>
                <select className="w-full border rounded px-3 py-2 text-gray-500">
                  <option>Não informar</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-950">Telefone</label>
                <input type="text" placeholder="(99) 99999-9999" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              <div>
                <label className="block font-semibold text-gray-950">CPF</label>
                <input type="text" placeholder="123.456.789-00" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              <div>
                <label className="block font-semibold text-gray-950">CEP</label>
                <input type="text" placeholder="12345-678" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-950">Endereço</label>
                <input type="text" placeholder="Rua Arduino de Moura" className="w-full border rounded px-3 py-2 text-gray-500" />
              </div>

              {/* Botões */}
              <div className="md:col-span-2 flex justify-between mt-4">
                <button type="button" className="bg-gray-300 text-black font-semibold px-6 py-2 rounded hover:bg-gray-400">
                  Voltar
                </button>
                <button type="submit" className="bg-blue-950 text-white font-semibold px-6 py-2 rounded hover:bg-blue-800">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
