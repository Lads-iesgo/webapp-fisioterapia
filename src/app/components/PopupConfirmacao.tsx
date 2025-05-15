import React from "react";

interface PopupConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  textoBotao?: string;
  aoFechar: () => void;
}

export default function PopupConfirmacao({
  aberto,
  titulo,
  descricao,
  textoBotao = "OK",
  aoFechar,
}: PopupConfirmacaoProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="bg-blue-900 rounded-t-lg px-6 py-3 flex items-center">
          <img src="/logo-iesgo.png" alt="IESGO" className="h-6 mr-3" />
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