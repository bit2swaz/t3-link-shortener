import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getLatest: publicProcedure.query(() => {
    // Placeholder for fetching the latest post
    return {
      id: "1",
      name: "placeholder post",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      // Simulate saving a new post
      // In a real application, you would interact with your database here
      console.log(
        `Creating post with name: ${input.name} by user: ${ctx.userId}`,
      );
      return {
        id: "new-post-id",
        name: input.name,
        message: "Post created successfully!",
      };
    }),
});
