import { env } from "~/env.js";
import {
  createServerClient as _createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function createServerClient(): SupabaseClient {
  return _createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookies()).set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          (await cookies()).delete({ name, ...options });
        },
      },
    },
  );
}
