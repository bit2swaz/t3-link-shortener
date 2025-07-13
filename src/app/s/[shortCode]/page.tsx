import { redirect } from "next/navigation";
// import { db } from "~/server/db"; // No longer needed for direct DB access
import { api } from "~/trpc/server"; // Import server-side tRPC
import { TRPCError } from "@trpc/server"; // Import TRPCError for error handling

interface ShortUrlPageProps {
  params: Promise<{
    shortCode: string;
  }>;
}

export default async function ShortUrlPage({ params }: ShortUrlPageProps) {
  const { shortCode } = await params; // Await params as it's now typed as a Promise

  if (!shortCode) {
    redirect("/link-status?message=Short%20URL%20not%20provided.");
  }

  try {
    const { longUrl } = await api.link.redirect({ shortCode });
    redirect(longUrl);
  } catch (error) {
    let errorMessage = "An unexpected error occurred.";

    if (error instanceof TRPCError) {
      if (error.code === "NOT_FOUND") {
        errorMessage = "Link not found.";
      } else if (error.code === "FORBIDDEN") {
        errorMessage = "Link has expired.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = `An unexpected error occurred: ${error.message}`;
    }

    redirect(`/link-status?message=${encodeURIComponent(errorMessage)}`);
  }
}
