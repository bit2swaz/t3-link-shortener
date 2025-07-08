/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createServerClient } from "~/lib/supabase/server";
import { cookies } from "next/headers";

import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * These are useful for:-
 * - Testing: mock requests of different shapes with different contexts
 * - Security: parse and validate requests
 */
export const createTRPCContext = async () => {
  const supabase = createServerClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    db,
    userId: user?.id ?? null,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the API to the Data Model.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({
    shape,
    error,
  }: {
    shape: { data: object; message: string; code: string; stack?: string };
    error: TRPCError;
  }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE !)*/
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API.
 * It does not guarantee that a user querying is authorized, but it does guarantee that
 * the user is not logged in if they don't have a session.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to only work if we have a logged in user, use this. It ensures
 * that a user querying has a session.  This is a good choice if you are using simple session
 * management (no roles, etc.). You can use it as a base for other pieces, like queries that
 * are authorized by specific roles.  The `ctx.session` will be populated, but `ctx.session.user` will not be.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      userId: ctx.userId,
    },
  });
});
