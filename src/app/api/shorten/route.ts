import { nanoid } from "nanoid";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Base URL for the shortened links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface ShortenRequest {
  originalUrl: string;
  slug?: string;
}

export async function POST(request: Request) {
  try {
    // Get the authenticated user (if any)
    const session = await auth();
    const userId = session?.user?.id;

    const body = (await request.json()) as ShortenRequest;
    const { originalUrl, slug: customSlug } = body;

    // Validate originalUrl
    try {
      new URL(originalUrl);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return Response.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    // Check if URL already exists
    const existingUrl = await db.link.findUnique({
      where: { originalUrl },
    });

    if (existingUrl) {
      return Response.json(
        {
          error: "URL already shortened",
          slug: existingUrl.slug,
          shortUrl: `${BASE_URL}/${existingUrl.slug}`,
        },
        { status: 409 },
      );
    }

    // Generate or use custom slug
    const slug = customSlug ?? nanoid(7);

    // Check if slug already exists (if custom slug was provided)
    if (customSlug) {
      const existingSlug = await db.link.findUnique({
        where: { slug },
      });

      if (existingSlug) {
        return Response.json({ error: "Custom slug already in use" }, { status: 409 });
      }
    }

    // Get IP and User-Agent
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const userAgent = request.headers.get("user-agent") ?? "Unknown";

    // Store in database
    const link = await db.link.create({
      data: {
        slug,
        originalUrl,
        createdByIp: ip,
        userAgent,
        ...(userId ? { userId } : {}),
      },
    });

    return Response.json({
      slug: link.slug,
      shortUrl: `${BASE_URL}/${link.slug}`,
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  } catch (error) {
    console.error("Error shortening URL:", error);
    return Response.json({ error: "Failed to shorten URL" }, { status: 500 });
  }
}
