import { env } from "~/env.js";
import {
  createBrowserClient as _createBrowserClient,
  createServerClient as _createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
import { type cookies } from "next/headers";

export function createBrowserClient(): SupabaseClient {
  return _createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function createServerClient(
  cookieStore: ReturnType<typeof cookies>,
): SupabaseClient {
  return _createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return (cookieStore as any).get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
