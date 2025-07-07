"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Button } from "~/components/ui/button";

interface ShortenedLink {
  originalUrl: string;
  shortUrl: string;
  slug: string;
  createdAt: string;
}

export default function ShortenPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedLinks, setSavedLinks] = useState<ShortenedLink[]>([]);
  const [showSavedLinks, setShowSavedLinks] = useState(false);

  // Load saved links from localStorage on component mount
  useEffect(() => {
    const storedLinks = localStorage.getItem("shortenedLinks");
    if (storedLinks) {
      try {
        setSavedLinks(JSON.parse(storedLinks) as ShortenedLink[]);
      } catch (err) {
        console.error("Failed to parse stored links:", err);
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          ...(customSlug ? { slug: customSlug } : {}),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        shortUrl?: string;
        slug?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to shorten URL");
        return;
      }

      if (data.shortUrl) {
        setShortUrl(data.shortUrl);

        // Save to localStorage
        const newLink: ShortenedLink = {
          originalUrl,
          shortUrl: data.shortUrl,
          slug: data.slug ?? "",
          createdAt: new Date().toISOString(),
        };

        const updatedLinks = [newLink, ...savedLinks].slice(0, 10); // Keep only the 10 most recent links
        setSavedLinks(updatedLinks);
        localStorage.setItem("shortenedLinks", JSON.stringify(updatedLinks));
      }
    } catch (err) {
      setError("An error occurred while shortening the URL");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You could add a toast notification here if you want
        console.log("URL copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Shorten a URL</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="originalUrl" className="mb-1 block font-medium">
            URL to Shorten (Required)
          </label>
          <input
            id="originalUrl"
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            required
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="customSlug" className="mb-1 block font-medium">
            Custom Slug (Optional)
          </label>
          <input
            id="customSlug"
            type="text"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder="my-custom-slug"
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Shortening..." : "Shorten URL"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSavedLinks(!showSavedLinks)}
            disabled={savedLinks.length === 0}
          >
            {showSavedLinks ? "Hide" : "View"} shortened links
          </Button>
        </div>
      </form>

      {error && <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">{error}</div>}

      {shortUrl && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <p className="font-medium">Your shortened URL:</p>
          <div className="mt-1 flex items-center gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-600 hover:underline"
            >
              {shortUrl}
            </a>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(shortUrl)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      {showSavedLinks && savedLinks.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h2 className="mb-4 text-xl font-semibold">Your shortened links</h2>
          <div className="space-y-3">
            {savedLinks.map((link, index) => (
              <div key={index} className="rounded-md border p-3">
                <p className="mb-1 text-sm text-gray-500 truncate" title={link.originalUrl}>
                  Original: {link.originalUrl}
                </p>
                <div className="flex items-center justify-between">
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.shortUrl}
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.shortUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
