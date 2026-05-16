"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setApiToken } from "@/lib/api";
import type { ApiResource, AuthenticatedUser, AuthSession } from "@/types/auth";

type AuthContextValue = {
  token: string | null;
  user: AuthenticatedUser | null;
  activeAccountId: number | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveAccountId: (accountId: number | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const tokenStorageKey = "launchbill.token";
const accountStorageKey = "launchbill.activeAccountId";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [activeAccountId, setActiveAccountIdState] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setActiveAccountId = useCallback((accountId: number | null) => {
    setActiveAccountIdState(accountId);

    if (accountId) {
      window.localStorage.setItem(accountStorageKey, String(accountId));
      api.defaults.headers.common["X-Account-Id"] = String(accountId);
      return;
    }

    window.localStorage.removeItem(accountStorageKey);
    delete api.defaults.headers.common["X-Account-Id"];
  }, []);

  const hydrateUser = useCallback(
    async (storedToken: string) => {
      setApiToken(storedToken);
      const response = await api.get<ApiResource<AuthenticatedUser>>("/auth/me");
      setUser(response.data.data);

      const storedAccountId = Number(window.localStorage.getItem(accountStorageKey));
      const firstAccountId = response.data.data.accounts[0]?.id ?? null;
      const nextAccountId =
        response.data.data.accounts.some((account) => account.id === storedAccountId)
          ? storedAccountId
          : firstAccountId;

      setActiveAccountId(nextAccountId);
    },
    [setActiveAccountId],
  );

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenStorageKey);

    if (!storedToken) {
      queueMicrotask(() => setIsReady(true));
      return;
    }

    queueMicrotask(() => {
      setToken(storedToken);
      hydrateUser(storedToken)
        .catch(() => {
          window.localStorage.removeItem(tokenStorageKey);
          setApiToken(null);
          setUser(null);
        })
        .finally(() => setIsReady(true));
    });
  }, [hydrateUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post<ApiResource<AuthSession>>("/auth/login", {
        email,
        password,
        device_name: "launchbill-frontend",
      });

      const session = response.data.data;
      window.localStorage.setItem(tokenStorageKey, session.token);
      setApiToken(session.token);
      setToken(session.token);
      setUser(session.user);
      setActiveAccountId(session.user.accounts[0]?.id ?? null);
    },
    [setActiveAccountId],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      window.localStorage.removeItem(tokenStorageKey);
      window.localStorage.removeItem(accountStorageKey);
      setApiToken(null);
      setToken(null);
      setUser(null);
      setActiveAccountIdState(null);
      delete api.defaults.headers.common["X-Account-Id"];
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      activeAccountId,
      isReady,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      setActiveAccountId,
    }),
    [activeAccountId, isReady, login, logout, setActiveAccountId, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
