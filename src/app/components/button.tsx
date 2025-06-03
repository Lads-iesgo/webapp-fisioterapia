"use client";

//Importnado React para criar componentes funcionais
import React from "react";

//Criando a interface ButtonProps para definir as propriedades do componente Button
interface ButtonProps {
  text: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary"; // 'primary' para o azul escuro, 'secondary' para o cinza claro
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

//Criando o componente Button como um componente funcional do React
const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  disabled,
}) => {
  const baseStyle =
    "px-8 py-2.5 rounded-full font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";

  const primaryStyle =
    "bg-blue-800 text-white hover:bg-blue-900 focus:ring-blue-700";
  const secondaryStyle =
    "bg-gray-200 text-blue-800 hover:bg-gray-300 focus:ring-gray-400";

  const buttonStyle = variant === "primary" ? primaryStyle : secondaryStyle;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${buttonStyle} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
