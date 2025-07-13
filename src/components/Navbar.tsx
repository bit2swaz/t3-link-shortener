"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="border-b border-neutral-800 bg-neutral-950 py-5 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" passHref>
          <span className="animate-pulse-glow cursor-pointer text-3xl font-extrabold text-purple-600 shadow-purple-500">
            T3 Link Shortener
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" passHref>
            <span className="cursor-pointer font-medium transition-colors duration-200 hover:text-purple-400">
              Homepage
            </span>
          </Link>
          <Link href="/dashboard" passHref>
            <span className="cursor-pointer font-medium transition-colors duration-200 hover:text-purple-400">
              Dashboard
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
