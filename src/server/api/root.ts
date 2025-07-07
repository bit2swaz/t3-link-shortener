import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
// Remove this line: import { postRouter } from "~/server/api/routers/post";

export const appRouter = createTRPCRouter({
  // Remove this line: post: postRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
