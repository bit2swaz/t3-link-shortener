"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="border-b border-neutral-800 bg-neutral-950 py-5 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" passHref>
          <span className="animate-pulse-glow text-3xl font-extrabold text-purple-600 shadow-purple-500 sm:text-4xl">
            T3 Link Shortener
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" passHref>
            <span className="cursor-pointer text-lg font-medium text-neutral-300 transition-colors transition-transform duration-100 duration-200 hover:text-purple-400 active:scale-95 sm:text-xl">
              Homepage
            </span>
          </Link>
          <Link href="/dashboard" passHref>
            <span className="cursor-pointer text-lg font-medium text-neutral-300 transition-colors transition-transform duration-100 duration-200 hover:text-purple-400 active:scale-95 sm:text-xl">
              Dashboard
            </span>
          </Link>
          <Link href="/how-to-use" passHref>
            <span className="cursor-pointer text-lg font-medium text-neutral-300 transition-colors transition-transform duration-100 duration-200 hover:text-purple-400 active:scale-95 sm:text-xl">
              How to Use
            </span>
          </Link>
          <Link href="/about" passHref>
            <span className="cursor-pointer text-lg font-medium text-neutral-300 transition-colors transition-transform duration-100 duration-200 hover:text-purple-400 active:scale-95 sm:text-xl">
              About
            </span>
          </Link>
          <Link href="/contact-us" passHref>
            <span className="cursor-pointer text-lg font-medium text-neutral-300 transition-colors transition-transform duration-100 duration-200 hover:text-purple-400 active:scale-95 sm:text-xl">
              Contact Us
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
