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

      // Check if a user with ctx.userId already exists.
      // If it does, update the username. If not, create a new user with the given ID and username.
      const upsertedUser = await ctx.db.user.upsert({
        where: {
          id: ctx.userId,
        },
        update: {
          username: input.username,
        },
        create: {
          id: ctx.userId,
          username: input.username,
        },
      });

      return upsertedUser;
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
        id: true,
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

  resetDailyCount: protectedProcedure
    .input(z.void())
    .mutation(async ({ ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.userId },
        data: { dailyShortenCount: 0, lastShortenDate: new Date() },
      });

      return updatedUser;
    }),
});
