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

  recoverAccount: protectedProcedure
    .input(z.object({ oldToken: z.string().uuid("Invalid token format.") }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const oldUser = await ctx.db.user.findUnique({
        where: { id: input.oldToken },
      });

      if (!oldUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Old token not found or invalid.",
        });
      }

      // Prevent merging with self
      if (oldUser.id === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This is your current account token.",
        });
      }

      let mergedLinkCount = 0;
      const oldLinks = await ctx.db.link.findMany({
        where: { userId: oldUser.id },
      });

      for (const oldLink of oldLinks) {
        const existingLinkForCurrentUser = await ctx.db.link.findFirst({
          where: { userId: ctx.userId, shortCode: oldLink.shortCode },
        });

        if (!existingLinkForCurrentUser) {
          await ctx.db.link.create({
            data: {
              longUrl: oldLink.longUrl,
              shortCode: oldLink.shortCode,
              clicks: oldLink.clicks,
              userId: ctx.userId,
              expiresAt: oldLink.expiresAt,
              createdAt: oldLink.createdAt,
            },
          });
          mergedLinkCount++;
        }
      }

      // Update current user's username if the old user had one and the current user doesn't
      // or if you always prefer the old username.
      // For this implementation, we'll update if current user has no username or if the old username is different.
      if (
        oldUser.username &&
        (ctx.userData?.username === null ||
          oldUser.username !== ctx.userData?.username)
      ) {
        await ctx.db.user.update({
          where: { id: ctx.userId },
          data: { username: oldUser.username },
        });
      }

      // Update current user's totalLinksCreated
      if (mergedLinkCount > 0) {
        await ctx.db.user.update({
          where: { id: ctx.userId },
          data: { totalLinksCreated: { increment: mergedLinkCount } },
        });
      }

      // Optionally delete the old user entry after successfully merging links
      // This should be done carefully, considering data retention policies.
      await ctx.db.user.delete({
        where: { id: oldUser.id },
      });

      // Temporarily simplify return to debug type inference
      return { message: "Success" };
    }),
});
