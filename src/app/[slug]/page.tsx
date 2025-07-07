// src/app/[slug]/page.tsx
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function SlugPage({ params }: PageProps) {
  // Temporary placeholder - will implement actual logic later
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Link Shortener
        </h1>
        <p className="text-gray-600">
          Looking for:{" "}
          <span className="rounded bg-gray-200 px-2 py-1 font-mono">
            {params.slug}
          </span>
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Redirect functionality coming soon...
        </p>
      </div>
    </div>
  );
}

// Optional: Add metadata generation
export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Redirecting... | Link Shortener`,
    description: `Redirecting to ${params.slug}`,
  };
}
