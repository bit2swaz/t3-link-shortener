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
        shortCode: z.string().optional(),
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
      const lifetimeLimit = 100; // Example limit
      if (user.totalLinksCreated >= lifetimeLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Lifetime link creation limit exceeded.",
        });
      }

      // Check daily link limit
      const dailyLimit = 10; // Example limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        user.lastShortenDate &&
        user.lastShortenDate.getTime() < today.getTime()
      ) {
        // Reset daily count if it's a new day
        await ctx.db.user.update({
          where: { id: ctx.userId },
          data: { dailyShortenCount: 0, lastShortenDate: today },
        });
        user.dailyShortenCount = 0;
        user.lastShortenDate = today;
      }

      if (user.dailyShortenCount >= dailyLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Daily link creation limit exceeded.",
        });
      }

      let shortCode = input.shortCode;
      if (shortCode) {
        const existingSlug = await ctx.db.link.findUnique({
          where: { shortCode },
        });
        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Custom slug is already taken.",
          });
        }
      } else {
        shortCode = nanoid(7); // Generate a 7-character short code
        let isUnique = false;
        while (!isUnique) {
          const existingSlug = await ctx.db.link.findUnique({
            where: { shortCode },
          });
          if (!existingSlug) {
            isUnique = true;
          } else {
            shortCode = nanoid(7); // Regenerate if taken
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
          shortCode: shortCode,
          userId: ctx.userId,
          expiresAt: expiresAt,
        },
      });

      // Update user's link counts
      await ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          totalLinksCreated: { increment: 1 },
          dailyShortenCount: { increment: 1 },
          lastShortenDate: today, // Update lastShortenDate for the current day
        },
      });

      return {
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${newLink.shortCode}`,
      };
    }),
});
