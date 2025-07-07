import { db } from "~/server/db";
import { type NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
    // Find the link by slug
    const link = await db.link.findUnique({
      where: { slug },
    });

    // If not found, return 404
    if (!link) {
      return new Response("Link not found", { status: 404 });
    }

    // Increment click count
    await db.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    });

    // Redirect to the original URL
    return Response.redirect(link.originalUrl, 302);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
  } catch (error: unknown) {
    console.error("Error redirecting:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
