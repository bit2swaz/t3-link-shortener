"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import Navbar from "~/components/Navbar";
import Link from "next/link";

export default function LinkStatusPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "No status message provided.";

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-50">
      <Navbar />
      <main className="flex flex-grow items-center justify-center px-4 text-center">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-neutral-800 p-8 shadow-lg">
          <h1 className="mb-4 text-4xl font-bold text-purple-600">
            Link Status
          </h1>
          <p className="text-lg text-neutral-300">{message}</p>
          <Link href="/" passHref>
            <Button className="mt-6 w-full rounded-md bg-purple-600 py-2 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-purple-700">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
