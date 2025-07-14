"use client";

import React from "react";
import Navbar from "~/components/Navbar";

const ContactUsPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-neutral-950 p-8 text-neutral-50">
      <Navbar />
      <main className="mx-auto max-w-3xl py-12 text-center">
        <h1 className="animate-fade-in-down mb-6 text-4xl font-bold text-purple-600">
          Contact Us
        </h1>
        <p className="animate-fade-in mb-4 text-lg leading-relaxed text-neutral-300">
          For inquiries, feedback, or support, please don&apos;t hesitate to
          reach out to us. You can send an email to:
        </p>
        <p className="animate-fade-in text-xl font-semibold text-purple-400 delay-100">
          bit2swaz@gmail.com
        </p>
        <p className="animate-fade-in mt-6 text-lg leading-relaxed text-neutral-300 delay-200">
          We aim to respond to all messages within 24-48 hours.
        </p>
      </main>
    </div>
  );
};

export default ContactUsPage;
