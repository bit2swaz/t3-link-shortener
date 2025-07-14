"use client";

import React from "react";
import Navbar from "~/components/Navbar";

const ContactUsPage = () => {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-neutral-950 p-4 text-neutral-50">
        <div className="flex flex-grow flex-col items-center justify-center py-20 text-center">
          <h1 className="gradient-text animate-gradient-text animate-fade-in-down z-10 mb-6 inline-block text-4xl font-bold sm:text-5xl md:text-6xl">
            Contact Us
          </h1>
          <p className="animate-fade-in mb-4 max-w-3xl text-lg leading-relaxed text-neutral-300 sm:text-xl md:text-2xl">
            For inquiries, feedback, or support, please don&apos;t hesitate to
            reach out to us. You can send an email to:
          </p>
          <p className="animate-fade-in text-xl font-semibold text-purple-400 delay-100">
            bit2swaz@gmail.com
          </p>
          <p className="animate-fade-in mt-6 text-lg leading-relaxed text-neutral-300 delay-200">
            We aim to respond to all messages within 24-48 hours.
          </p>
        </div>
      </main>
    </>
  );
};

export default ContactUsPage;
