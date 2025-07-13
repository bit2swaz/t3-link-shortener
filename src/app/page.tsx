"use client";

import Link from "next/link";
import Navbar from "~/components/Navbar";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-neutral-50">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <h1 className="animate-fade-in mb-6 text-6xl font-extrabold text-purple-600">
            Shorten. <span className="text-purple-600">Share.</span> Track.
          </h1>
          <p className="animate-fade-in mb-8 max-w-3xl text-xl text-neutral-300">
            Your personal link shortener, powered by the T3 Stack.
          </p>
          <div>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                className="active:animate-button-press transform rounded-full bg-purple-600 px-10 py-4 font-bold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-purple-700"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
