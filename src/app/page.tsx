"use client";

import Link from "next/link";
import Navbar from "~/components/Navbar";
import { Button } from "~/components/ui/button";
import { BarChart, Link as LinkIcon, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-neutral-950 p-4 text-neutral-50">
        <div className="flex flex-grow flex-col items-center justify-center py-20 text-center">
          <h1 className="gradient-text animate-gradient-text animate-fade-in-down z-10 mb-6 inline-block text-5xl font-extrabold drop-shadow-[0_0_8px_rgba(167,139,250,0.6)] sm:text-6xl md:text-7xl">
            Shorten. <span className="text-purple-600">Share.</span> Track.
          </h1>
          <p className="animate-fade-in mb-10 max-w-3xl text-lg text-neutral-300 sm:text-xl md:text-2xl">
            Your personal link shortener, powered by the T3 Stack.
          </p>
          <div>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                className="animate-pop-in transform rounded-full bg-purple-600 px-10 py-4 font-bold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-purple-700 active:scale-98"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        <section className="w-full border-t border-b border-neutral-800 bg-neutral-900 py-16">
          <h2 className="animate-fade-in-up mb-12 text-center text-4xl font-bold text-purple-600">
            Why T3 Link Shortener?
          </h2>
          <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-3">
            <div className="animate-fade-in-up transform rounded-lg border border-neutral-700 bg-neutral-800 p-6 text-center shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <LinkIcon className="animate-wobble-hover mx-auto mb-4 text-5xl text-purple-400" />
              <h3 className="mb-2 text-xl font-semibold text-neutral-50">
                Intuitive Shortening
              </h3>
              <p className="text-sm text-neutral-300">
                Quickly transform long URLs into short, shareable links with
                optional custom slugs and expiry dates.
              </p>
            </div>
            <div className="animate-fade-in-up transform rounded-lg border border-neutral-700 bg-neutral-800 p-6 text-center shadow-lg transition-all delay-100 duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <BarChart className="animate-wobble-hover mx-auto mb-4 text-5xl text-purple-400" />
              <h3 className="mb-2 text-xl font-semibold text-neutral-50">
                Detailed Analytics
              </h3>
              <p className="text-sm text-neutral-300">
                Gain insights into your link performance with comprehensive
                click tracking and data visualization.
              </p>
            </div>
            <div className="animate-fade-in-up transform rounded-lg border border-neutral-700 bg-neutral-800 p-6 text-center shadow-lg transition-all delay-200 duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <Clock className="animate-wobble-hover mx-auto mb-4 text-5xl text-purple-400" />
              <h3 className="mb-2 text-xl font-semibold text-neutral-50">
                Secure & Reliable
              </h3>
              <p className="text-sm text-neutral-300">
                Built with the robust T3 Stack, ensuring your links are secure,
                fast, and always available.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
