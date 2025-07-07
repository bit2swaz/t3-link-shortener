"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "~/components/ui/button";

export default function ShortenPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      const data = (await response.json()) as { error?: string; shortUrl?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to shorten URL");
        return;
      }

      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
      }
    } catch (err) {
      setError("An error occurred while shortening the URL");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Shortening..." : "Shorten URL"}
        </Button>
      </form>

      {error && <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">{error}</div>}

      {shortUrl && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <p className="font-medium">Your shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-blue-600 hover:underline"
          >
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}
