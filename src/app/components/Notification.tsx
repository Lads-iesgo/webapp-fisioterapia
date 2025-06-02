"use client";

//Importações necessárias
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

//Definindo os tipos de notificação
type NotificationType = "success" | "error" | "warning";

//Constante para o tempo padrão de exibição da notificação
const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 segundos

//Definindo a interface do contexto de notificação
interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    message: string,
    duration?: number
  ) => void;
  hideNotification: () => void;
}

//Definindo as propriedades do provider de notificação
interface NotificationProviderProps {
  children: ReactNode;
}

//Definindo o tipo do estado da notificação
interface NotificationState {
  type: NotificationType;
  message: string;
  show: boolean;
  duration: number; //Adicionar a duração ao estado
}

//Criar o contexto
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

//Provider que envolve a aplicação
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<NotificationState>({
    type: "success",
    message: "",
    show: false,
    duration: DEFAULT_NOTIFICATION_DURATION, //Usar a constante
  });

  //Fechar automaticamente após um tempo
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (notification.show) {
      //Usar a duração definida no estado da notificação
      timeoutId = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, notification.duration);
    }
    return () => clearTimeout(timeoutId);
  }, [notification.show, notification.duration]); //Adicionar duration às dependências

  //Função para mostrar notificação
  const showNotification = (
    type: NotificationType,
    message: string,
    duration: number = DEFAULT_NOTIFICATION_DURATION //Usar a constante como padrão
  ) => {
    //Definir a duração no estado ao mostrar a notificação
    setNotification({ type, message, show: true, duration });
  };

  //Função para esconder notificação
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}

      {/* Componente de notificação */}
      <div
        className={`fixed top-24 right-8 max-w-sm p-4 rounded-md shadow-lg transition-all duration-300 ${
          notification.show
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-4 pointer-events-none"
        } ${
          notification.type === "success"
            ? "bg-green-50 text-green-800 border-l-4 border-green-500"
            : notification.type === "error"
            ? "bg-red-50 text-red-800 border-l-4 border-red-500"
            : "bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500"
        }`}
        style={{
          zIndex: 9999,
        }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {notification.type === "success" ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : notification.type === "error" ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={hideNotification}
                className={`inline-flex rounded-md p-1.5 ${
                  notification.type === "success"
                    ? "text-green-500 hover:bg-green-100"
                    : notification.type === "error"
                    ? "text-red-500 hover:bg-red-100"
                    : "text-yellow-500 hover:bg-yellow-100"
                }`}
              >
                <span className="sr-only">Fechar</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

//Hook personalizado para usar a notificação
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification deve ser usado dentro de NotificationProvider"
    );
  }
  return context;
}
