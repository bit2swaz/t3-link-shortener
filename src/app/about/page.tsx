"use client";

import React from "react";
import Navbar from "~/components/Navbar";

const AboutPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-950 p-8 text-neutral-50">
      <Navbar />
      <main className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="animate-fade-in-down mb-6 text-4xl font-bold text-purple-600">
          About T3 Link Shortener
        </h1>
        <p className="animate-fade-in mb-4 text-lg leading-relaxed text-neutral-300">
          T3 Link Shortener is a practice project built with the powerful T3
          Stack (Next.js, TypeScript, Tailwind CSS, tRPC, Prisma, and
          NextAuth.js). Our goal is to provide a minimalist, aesthetically
          pleasing, and highly functional URL shortening service with robust
          analytics capabilities. This project serves as a learning experience,
          focusing on modern web development practices, clean UI/UX, and
          efficient data management.
        </p>
        <p className="animate-fade-in text-lg leading-relaxed text-neutral-300 delay-100">
          We believe in keeping things simple yet effective, allowing users to
          effortlessly shorten, share, and track their links with an intuitive
          interface.
        </p>
      </main>
    </div>
  );
};

export default AboutPage;
