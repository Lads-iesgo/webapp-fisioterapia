"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { UserRole, getUserGroup } from "../lib/permissions";

// ─── Tipos ───────────────────────────────────────────────────────────────────────────
interface UserData {
  email: string;
  nome: string;
  perfil: UserRole;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userGroup: "GROUP_1" | "GROUP_2" | null;
  logout: () => void;
  refreshUser: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = () => {
    try {
      const userDataString = localStorage.getItem("userData");
      if (userDataString) {
        const parsed = JSON.parse(userDataString);
        setUser({
          email: parsed.email || "",
          nome: parsed.nome || "",
          perfil: String(parsed.perfil || "").toLowerCase() as UserRole,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Atualiza quando o localStorage é alterado (ex: após login em outra aba)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "userData") loadUser();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem("userData");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  };

  const refreshUser = () => loadUser();

  const userGroup = getUserGroup(user?.perfil);
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        userGroup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
