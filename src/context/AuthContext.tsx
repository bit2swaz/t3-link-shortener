"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
} from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { createBrowserClient } from "~/lib/supabase";

type User = {
  id: string;
  username: string | null;
};

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loadingAuth: boolean;
  isAuthReady: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setLoadingAuth(true);
      if (session) {
        setUser({ id: session.user.id, username: null });
      } else {
        void supabase.auth.signInAnonymously();
      }
      setLoadingAuth(false);
      setIsAuthReady(true);
    });

    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        await supabase.auth.signInAnonymously();
      }
      setLoadingAuth(false);
      setIsAuthReady(true);
    };

    void checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value = {
    supabase,
    user,
    setUser,
    loadingAuth,
    isAuthReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
