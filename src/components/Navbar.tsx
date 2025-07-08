"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" passHref>
          <span className="cursor-pointer text-2xl font-bold text-purple-600">
            T3 Link Shortener
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" passHref>
            <span className="cursor-pointer text-lg transition-colors hover:text-purple-600">
              Homepage
            </span>
          </Link>
          <Link href="/dashboard" passHref>
            <span className="cursor-pointer text-lg transition-colors hover:text-purple-600">
              Dashboard
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
