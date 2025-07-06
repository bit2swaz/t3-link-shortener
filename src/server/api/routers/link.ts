import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";

const linkInput = z.object({
  url: z.string().url(),
  slug: z.string().min(3).max(32).optional(),
});

export const linkRouter = createTRPCRouter({
  // Create a new link
  create: publicProcedure.input(linkInput).mutation(async ({ ctx, input }) => {
    const { url, slug } = input;
    const userId = ctx.session?.user.id;
    const ip = ctx.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Check rate limits based on user type
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const linksCreatedToday = await ctx.db.link.count({
      where: {
        OR: [
          { userId, createdAt: { gte: today } },
          { createdByIp: ip, createdAt: { gte: today } },
        ],
      },
    });

    const rateLimit = userId
      ? ctx.session?.user.subscriptionPlan === "pro"
        ? env.RATE_LIMIT_PRO
        : env.RATE_LIMIT_FREE
      : env.RATE_LIMIT_ANONYMOUS;

    if (linksCreatedToday >= rateLimit) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `You've reached your daily limit of ${rateLimit} links.`,
      });
    }

    // Generate or validate slug
    const finalSlug = slug ?? nanoid(8);
    const existingLink = await ctx.db.link.findUnique({
      where: { slug: finalSlug },
    });

    if (existingLink) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This slug is already taken.",
      });
    }

    // Create the link
    const link = await ctx.db.link.create({
      data: {
        slug: finalSlug,
        originalUrl: url,
        userId,
        createdByIp: ip.toString(),
      },
    });

    return link;
  }),

  // Get all links for the current user
  getUserLinks: protectedProcedure.query(async ({ ctx }) => {
    const links = await ctx.db.link.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    return links;
  }),

  // Get analytics for a specific link
  getLinkAnalytics: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.link.findUnique({
        where: { id: input.linkId },
        include: {
          clicks: {
            orderBy: { timestamp: "desc" },
            take: 1000, // Limit to last 1000 clicks
          },
          _count: {
            select: { clicks: true },
          },
        },
      });

      if (!link) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (link.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this link's analytics",
        });
      }

      return link;
    }),

  // Delete a link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.link.findUnique({
        where: { id: input.id },
      });

      if (!link) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (link.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this link",
        });
      }

      await ctx.db.link.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Update a link's slug
  update: protectedProcedure
    .input(z.object({ id: z.string(), slug: z.string().min(3).max(32) }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.link.findUnique({
        where: { id: input.id },
      });

      if (!link) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (link.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this link",
        });
      }

      // Check if slug is already taken
      const existingLink = await ctx.db.link.findUnique({
        where: { slug: input.slug },
      });

      if (existingLink && existingLink.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This slug is already taken",
        });
      }

      const updatedLink = await ctx.db.link.update({
        where: { id: input.id },
        data: { slug: input.slug },
      });

      return updatedLink;
    }),
});
