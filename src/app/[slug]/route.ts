import { db } from "~/server/db";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  try {
    // Find the link by slug
    const link = await db.link.findUnique({
      where: { slug },
    });

    // If not found, return 404
    if (!link) {
      return new Response("Link not found", { status: 404 });
    }

    // Redirect to the original URL
    return Response.redirect(link.originalUrl, 302);
  } catch (error) {
    console.error("Error redirecting:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
