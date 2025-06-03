//Imortações necessárias
import React from "react";
import Image from "next/image";

//Definindo a interface PopupConfirmacaoProps para as propriedades do componente
interface PopupConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  textoBotao?: string;
  aoFechar: () => void;
}

//Componente PopupConfirmacao que exibe um popup de confirmação
export default function PopupConfirmacao({
  aberto,
  titulo,
  descricao,
  textoBotao = "OK",
  aoFechar,
}: PopupConfirmacaoProps) {
  //Se o popup não estiver aberto, retorna null para não renderizar nada
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="bg-blue-900 rounded-t-lg px-6 py-3 flex items-center">
          <Image
            src="/logo-iesgo.png"
            alt="IESGO"
            width={24}
            height={24}
            className="mr-3"
          />
          <span className="text-white font-semibold text-lg">{titulo}</span>
        </div>
        <div className="p-6 text-center">
          <p className="text-black mb-6">{descricao}</p>
          <button
            onClick={aoFechar}
            className="bg-blue-900 text-white px-8 py-2 rounded font-semibold hover:bg-blue-800"
          >
            {textoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}
