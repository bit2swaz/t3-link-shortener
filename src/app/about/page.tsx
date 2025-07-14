"use client";

import React from "react";
import Navbar from "~/components/Navbar";

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-neutral-950 p-4 text-neutral-50">
        <div className="flex flex-grow flex-col items-center justify-center py-20 text-center">
          <h1 className="gradient-text animate-gradient-text animate-fade-in-down mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
            About T3 Link Shortener
          </h1>
          <p className="animate-fade-in mb-4 max-w-3xl text-lg leading-relaxed text-neutral-300 sm:text-xl md:text-2xl">
            T3 Link Shortener is a practice project built with the powerful T3
            Stack (Next.js, TypeScript, Tailwind CSS, tRPC, Prisma, and
            NextAuth.js). Our goal is to provide a minimalist, aesthetically
            pleasing, and highly functional URL shortening service with robust
            analytics capabilities. This project serves as a learning
            experience, focusing on modern web development practices, clean
            UI/UX, and efficient data management.
          </p>
          <p className="animate-fade-in text-lg leading-relaxed text-neutral-300 delay-100">
            We believe in keeping things simple yet effective, allowing users to
            effortlessly shorten, share, and track their links with an intuitive
            interface.
          </p>
        </div>
      </main>
    </>
  );
};

export default AboutPage;
