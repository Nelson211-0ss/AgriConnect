import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken, clearToken, getToken } from '@/lib/api';

export type Role = 'super_admin' | 'extension_officer' | 'farmer' | 'buyer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  county?: string | null;
  avatar_url?: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; role?: Role; phone?: string; county?: string }) => Promise<User>;
  updateProfile: (data: { name?: string; avatar_url?: string | null }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  extension_officer: 'Extension Officer',
  farmer: 'Farmer',
  buyer: 'Buyer',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register: AuthContextValue['register'] = async (data) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', data);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (data) => {
    const res = await api.patch<{ user: User }>('/auth/profile', data);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
