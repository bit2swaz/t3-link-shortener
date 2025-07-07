import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }: { input: { text: string } }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // The following procedures required authentication and user context, which have been removed.
  // You can implement anonymous or public procedures here as needed.
});
