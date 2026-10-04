"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization_id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchApi("/api/v1/auth/me");
        setUser(data);
      } catch (error) {
        console.error("Failed to load user session", error);
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("access_token", token);
    setUser(userData);
    router.push("/inbox"); // redirect to main app after login
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
