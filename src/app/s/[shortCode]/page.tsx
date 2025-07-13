import { redirect } from "next/navigation";
// import { RedirectStatusCode } from "next/dist/client/components/redirect-status-code"; // Removed unused import
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

  let longUrl: string; // Declare longUrl outside try block
  try {
    const result = await api.link.redirect({ shortCode });
    longUrl = result.longUrl; // Assign to longUrl
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

    return redirect(`/link-status?message=${encodeURIComponent(errorMessage)}`); // Ensure function exits after redirect
  }

  // If we reach here, the API call was successful, now perform the actual redirect
  redirect(longUrl);
}
