"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Plus, ExternalLink, Copy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  // Anonymous dashboard: fetch links by UUID from localStorage
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        let uuid = localStorage.getItem("visitor_uuid");
        if (!uuid) {
          uuid = crypto.randomUUID();
          localStorage.setItem("visitor_uuid", uuid);
        }
        const response = await fetch(`/api/links?uuid=${uuid}`);
        if (!response.ok) throw new Error("Failed to fetch links");
        const data = (await response.json()) as Link[];
        setLinks(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load your links");
      } finally {
        setLoading(false);
      }
    };
    void fetchLinks();
  }, [router]);

  // No sign out for anonymous

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(id);
        toast.success("URL copied to clipboard!");
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch((err: unknown) => {
        toast.error("Failed to copy URL");
        console.error("Failed to copy:", err);
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your anonymous dashboard!</p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/shorten" className="flex items-center gap-2">
              <Plus size={16} />
              <span>Shorten New Link</span>
            </Link>
          </Button>
          {/* No sign out button for anonymous */}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Your Shortened Links</h2>
          <p className="text-sm text-muted-foreground">
            Manage all your shortened links in one place
          </p>
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No links yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              You haven&apos;t created any shortened links yet. Create your first one now!
            </p>
            <Button asChild className="mt-6">
              <Link href="/shorten">Shorten a URL</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.map((link) => {
                  const shortUrl = `${window.location.origin}/${link.slug}`;
                  return (
                    <tr key={link.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{link.slug}</span>
                        </div>
                      </td>
                      <td className="max-w-xs px-6 py-4">
                        <div className="truncate" title={link.originalUrl}>
                          {link.originalUrl}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">{link.clickCount}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(shortUrl, link.id)}
                            className="h-8 gap-1"
                          >
                            <Copy size={14} />
                            {copySuccess === link.id ? "Copied!" : "Copy"}
                          </Button>
                          <Button size="sm" variant="ghost" asChild className="h-8 gap-1">
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} />
                              Open
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
