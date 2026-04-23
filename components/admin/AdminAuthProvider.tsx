"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "admin_token";

interface AdminAuthContextType {
  token: string;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  token: "",
  logout: () => {},
});

export function useAdminToken() {
  return useContext(AdminAuthContext).token;
}

export function useAdminLogout() {
  return useContext(AdminAuthContext).logout;
}

function AdminLoginGate({ onLogin }: { onLogin: (token: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: value.trim() }),
      });

      if (res.ok) {
        onLogin(value.trim());
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="p-2 rounded-lg bg-primary/10 text-primary">
            <KeyRound className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-semibold">Admin Access</h1>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Enter admin secret"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive">Invalid admin secret.</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTokenState(sessionStorage.getItem(STORAGE_KEY) ?? "");
    setReady(true);
  }, []);

  const handleLogin = (t: string) => {
    sessionStorage.setItem(STORAGE_KEY, t);
    setTokenState(t);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setTokenState("");
  };

  if (!ready) return null;
  if (!token) return <AdminLoginGate onLogin={handleLogin} />;

  return (
    <AdminAuthContext.Provider value={{ token, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
