import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  updateUsername: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const existingUser = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (existingUser && existingUser.id !== ctx.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username is already taken.",
        });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.userId },
        data: { username: input.username },
      });

      return updatedUser;
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
    const userProfile = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: {
        username: true,
        totalLinksCreated: true,
        dailyShortenCount: true,
        lastShortenDate: true,
      },
    });

    if (!userProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found.",
      });
    }

    return userProfile;
  }),
});
