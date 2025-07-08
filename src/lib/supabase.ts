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
          // @ts-expect-error -- The `cookieStore` object from Next.js 15 is not compatible with the type expected by the Supabase SSR library.
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // @ts-expect-error -- The `cookieStore` object from Next.js 15 is not compatible with the type expected by the Supabase SSR library.
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // @ts-expect-error -- The `cookieStore` object from Next.js 15 is not compatible with the type expected by the Supabase SSR library.
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
