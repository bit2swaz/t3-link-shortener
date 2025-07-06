import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Find the link
  const link = await db.link.findUnique({
    where: { slug },
  });

  if (!link) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <h1 className="text-4xl font-bold">Link not found</h1>
        <p className="mt-4">The link you are looking for does not exist.</p>
      </div>
    );
  }

  // Redirect to the original URL
  redirect(link.originalUrl);
}
