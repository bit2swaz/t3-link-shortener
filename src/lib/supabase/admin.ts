/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { env } from "~/env.js";
import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};
