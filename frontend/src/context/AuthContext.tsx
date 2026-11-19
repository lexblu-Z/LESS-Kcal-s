import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, DailyGoal } from '../types';

interface AuthContextType {
  user: User | null;
  currentGoal: DailyGoal | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateGoalLocally: (goal: DailyGoal) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentGoal, setCurrentGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (api.getToken()) {
        const data = await api.getMe();
        setUser(data.user);
        setCurrentGoal(data.currentGoal);
      }
    } catch (e) {
      console.warn('Sessão expirada ou inválida:', e);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    const me = await api.getMe();
    setCurrentGoal(me.currentGoal);
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    const me = await api.getMe();
    setCurrentGoal(me.currentGoal);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setCurrentGoal(null);
  };

  const updateGoalLocally = (goal: DailyGoal) => {
    setCurrentGoal(goal);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentGoal,
        loading,
        login,
        register,
        logout,
        updateGoalLocally,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
