import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // If not authenticated, return 401
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    // Fetch user's links
    const links = await db.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(links);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  } catch (error) {
    console.error("Error fetching user links:", error);
    return Response.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
