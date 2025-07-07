/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RedirectPage({ params }: PageProps) {
  // Await the params to get the actual slug value
  const { slug } = await params;

  try {
    // Fetch the original URL from your database/storage
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${slug}`,
    );

    if (!response.ok) {
      throw new Error("URL not found");
    }

    const data = await response.json();

    // Redirect to the original URL
    if (typeof window !== "undefined") {
      window.location.href = data.url;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Redirecting...</h1>
          <p className="text-gray-600">
            If you're not redirected automatically,
            <a href={data.url} className="ml-1 text-blue-500 hover:underline">
              click here
            </a>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Link Not Found</h1>
          <p className="text-gray-600">
            The shortened link you're looking for doesn't exist or has expired.
          </p>
        </div>
      </div>
    );
  }
}
