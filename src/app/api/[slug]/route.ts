import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
  const userAgent = headersList.get("user-agent") ?? "Unknown";

  try {
    // Find the link
    const link = await db.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return new NextResponse("Link not found", { status: 404 });
    }

    // Track the click
    await db.clickEvent.create({
      data: {
        linkId: link.id,
        ip: ip.toString(),
        userAgent,
      },
    });

    // Update click count
    await db.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    });

    // Redirect to the original URL
    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error processing link:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
