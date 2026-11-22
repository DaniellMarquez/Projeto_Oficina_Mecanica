import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarUsuario = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await api.auth.me();
      setUsuario(dados);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  const login = useCallback(async (email, senha) => {
    const dados = await api.auth.login(email, senha);
    setUsuario(dados);
    return dados;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUsuario(null);
    }
  }, []);

  // Equivalente ao redirecionamento pós-login do login.js do vanilla.
  const destinoAposLogin = useCallback((nivel) => {
    if (nivel === "admin") return "/painel-admin";
    if (nivel === "funcionario") return "/painel-ordens";
    return "/";
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, carregarUsuario, destinoAposLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
