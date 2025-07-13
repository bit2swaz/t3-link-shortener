"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-neutral-950 py-4 text-center text-sm text-neutral-500">
      Made with ❤️ by{" "}
      <a
        href="https://www.github.com/bit2swaz"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 transition-colors duration-200 hover:text-purple-300"
      >
        bit2swaz
      </a>
    </footer>
  );
};

export default Footer;
