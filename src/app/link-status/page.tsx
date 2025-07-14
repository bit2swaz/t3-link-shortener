"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import Navbar from "~/components/Navbar";
import Link from "next/link";

export default function LinkStatusPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "No status message provided.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-neutral-50">
      <Navbar />
      <main className="flex flex-grow items-center justify-center px-4 text-center">
        <div className="w-full max-w-md space-y-6 p-8">
          <h1 className="animate-fade-in-down mb-6 text-4xl font-bold text-red-500 sm:text-5xl">
            Link Status
          </h1>
          <p className="animate-fade-in mb-8 text-lg text-neutral-300 sm:text-xl">
            {message}
          </p>
          <Link href="/" passHref>
            <Button className="mt-8 rounded-full bg-purple-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 active:scale-98">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
