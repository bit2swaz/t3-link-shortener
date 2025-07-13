import { redirect } from "next/navigation";
import { db } from "~/server/db";

interface ShortUrlPageProps {
  params: {
    slug: string;
  };
}

export default async function ShortUrlPage({ params }: ShortUrlPageProps) {
  const { slug } = params;

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-50">
        <p className="text-xl">Short URL not found.</p>
      </div>
    );
  }

  const link = await db.link.findUnique({
    where: { shortCode: slug },
  });

  if (!link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-50">
        <p className="text-xl">Link not found.</p>
      </div>
    );
  }

  // Check for expiry
  if (link.expiresAt && new Date() > link.expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-50">
        <p className="text-xl">This link has expired.</p>
      </div>
    );
  }

  // Increment click count
  await db.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  });

  redirect(link.longUrl);
}
