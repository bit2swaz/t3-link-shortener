"use client";

import React from "react";
import Navbar from "~/components/Navbar";

const HowToUsePage = () => {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-neutral-950 p-4 text-neutral-50">
        <div className="flex flex-grow flex-col items-center justify-center py-20 text-center">
          <h1 className="gradient-text animate-gradient-text animate-fade-in-down z-10 mb-6 inline-block text-4xl font-bold sm:text-5xl md:text-6xl">
            How to Use T3 Link Shortener
          </h1>
          <p className="animate-fade-in mb-4 text-lg leading-relaxed text-neutral-300 sm:text-xl md:text-2xl">
            Our link shortener is designed for simplicity and efficiency. Follow
            these steps to get started:
          </p>

          <div className="mt-10 max-w-3xl space-y-8">
            <div className="animate-fade-in-up">
              <h2 className="mb-3 text-3xl font-semibold text-neutral-50">
                1. Shorten your URL
              </h2>
              <p className="text-lg leading-relaxed text-neutral-300">
                Paste your long, cumbersome URL into the input field on the
                dashboard. You can optionally add a custom slug for a more
                memorable short link.
              </p>
            </div>

            <div className="animate-fade-in-up delay-100">
              <h2 className="mb-3 text-3xl font-semibold text-neutral-50">
                2. Share your link
              </h2>
              <p className="text-lg leading-relaxed text-neutral-300">
                Once shortened, simply copy the new, concise URL. Share it
                anywhere: social media, emails, messages, or print it on your
                business cards!
              </p>
            </div>

            <div className="animate-fade-in-up delay-200">
              <h2 className="mb-3 text-3xl font-semibold text-neutral-50">
                3. Track your clicks
              </h2>
              <p className="text-lg leading-relaxed text-neutral-300">
                Log in to your dashboard to view how many times your links have
                been clicked, giving you insights into your audience engagement.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HowToUsePage;
