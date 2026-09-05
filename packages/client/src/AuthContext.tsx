import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { detectLang, translate, type Lang, type MsgKey } from './i18n';

interface AuthCtx {
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (t: string) => void;
  logout: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: MsgKey, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<AuthCtx | null>(null);

function parseAdmin(token: string | null): boolean {
  if (!token) return false;
  try {
    const part = token.split('.')[1];
    if (!part) return false;
    const json = JSON.parse(atob(part));
    return json.role === 'admin' || json.isAdmin === true || json.username === 'admin';
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ComponentChildren }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [lang, setLangState] = useState<Lang>(() => detectLang());

  useEffect(() => {
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    } catch {
      // private mode
    }
  }, [token]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('hl-lang', l);
    } catch {
      // ignore
    }
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const login = useCallback((t: string) => setToken(t), []);
  const logout = useCallback(() => setToken(null), []);
  const t = useCallback((key: MsgKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);

  const value: AuthCtx = {
    token,
    isLoggedIn: !!token,
    isAdmin: parseAdmin(token),
    login,
    logout,
    lang,
    setLang,
    t,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
