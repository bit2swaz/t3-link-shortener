import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const linkRouter = createTRPCRouter({
  checkSlugAvailability: protectedProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const existingLink = await ctx.db.link.findUnique({
        where: { shortCode: input.slug },
      });
      return { isAvailable: !existingLink };
    }),

  create: protectedProcedure
    .input(
      z.object({
        longUrl: z.string().url(),
        shortCode: z.string().min(3).max(20).optional(), // Updated schema
        expiryOption: z.enum([
          "1_day",
          "1_week",
          "1_month",
          "3_months",
          "1_year",
          "never",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      // Check lifetime link limit
      const lifetimeLimit = 30; // Updated limit
      if (user.totalLinksCreated >= lifetimeLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You have reached your lifetime limit of 30 shortened links.",
        });
      }

      // Check daily link limit (consider daily count as 0 if lastShortenDate is from previous day)
      const dailyLimit = 5; // Updated limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const effectiveDailyCount =
        user.lastShortenDate && user.lastShortenDate.getTime() < today.getTime()
          ? 0
          : user.dailyShortenCount; // Daily count is reset on client via resetDailyCount

      if (effectiveDailyCount >= dailyLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You have reached your daily limit of 5 shortened links. Please try again tomorrow.",
        });
      }

      let finalShortCode = input.shortCode;
      if (finalShortCode) {
        const existingSlug = await ctx.db.link.findUnique({
          where: { shortCode: finalShortCode },
        });
        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Custom slug is already taken. Please choose another.",
          });
        }
      } else {
        finalShortCode = nanoid(7); // Generate a 7-character short code
        let isUnique = false;
        while (!isUnique) {
          const existingSlug = await ctx.db.link.findUnique({
            where: { shortCode: finalShortCode },
          });
          if (!existingSlug) {
            isUnique = true;
          } else {
            finalShortCode = nanoid(7); // Regenerate if taken
          }
        }
      }

      let expiresAt: Date | null = null;
      const now = new Date();

      switch (input.expiryOption) {
        case "1_day":
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "1_week":
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "1_month":
          expiresAt = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate(),
          );
          break;
        case "3_months":
          expiresAt = new Date(
            now.getFullYear(),
            now.getMonth() + 3,
            now.getDate(),
          );
          break;
        case "1_year":
          expiresAt = new Date(
            now.getFullYear() + 1,
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "never":
          expiresAt = null;
          break;
      }

      const newLink = await ctx.db.link.create({
        data: {
          longUrl: input.longUrl,
          shortCode: finalShortCode,
          userId: ctx.userId,
          clicks: 0, // Initialize clicks to 0
          createdAt: new Date(), // Set creation date
          expiresAt: expiresAt,
        },
      });

      // Update user's link counts
      await ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          totalLinksCreated: { increment: 1 },
          dailyShortenCount: { increment: 1 },
          lastShortenDate: new Date(), // Update lastShortenDate to now
        },
      });

      return {
        shortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/s/${newLink.shortCode}`,
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const links = await ctx.db.link.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
    return links;
  }),
});
