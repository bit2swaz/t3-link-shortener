"use client";

import Link from "next/link";
import Navbar from "~/components/Navbar";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <h1 className="animate-slide-in-down text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Shorten. <span className="text-purple-600">Share.</span> Track.
          </h1>
          <p className="animate-fade-in fill-mode-backwards text-2xl text-white/80 [animation-delay:0.5s]">
            Your personal link shortener, powered by the T3 Stack.
          </p>
          <div className="animate-bounce-in fill-mode-backwards [animation-delay:1s]">
            <Link href="/dashboard" passHref>
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
