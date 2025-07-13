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

import { createBrowserClient } from "~/lib/supabase/client";

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
    const checkUser = async () => {
      setLoadingAuth(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const storedUsername = localStorage.getItem(
          "t3-link-shortener-username",
        );
        setUser({ id: session.user.id, username: storedUsername ?? null });
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Error signing in anonymously:", error);
        } else if (data.user) {
          setUser({ id: data.user.id, username: null });
        }
      }
      setLoadingAuth(false);
      setIsAuthReady(true);
    };

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const storedUsername = localStorage.getItem(
          "t3-link-shortener-username",
        );
        setUser({ id: session.user.id, username: storedUsername ?? null });
      } else {
        setUser(null);
      }
    });

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
