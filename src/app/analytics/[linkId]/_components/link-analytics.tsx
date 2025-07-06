"use client";

import { api } from "~/trpc/react";

export function LinkAnalytics({ linkId }: { linkId: string }) {
  const { data: link } = api.link.getLinkAnalytics.useQuery({ linkId });

  if (!link) {
    return <div>Link not found</div>;
  }

  // Group clicks by date
  const clicksByDate = link.clicks.reduce<Record<string, number>>(
    (acc, click) => {
      const date = new Date(click.timestamp).toLocaleDateString();
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // Group clicks by user agent
  const clicksByUserAgent = link.clicks.reduce<Record<string, number>>(
    (acc, click) => {
      const userAgent = click.userAgent;
      acc[userAgent] = (acc[userAgent] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // Group clicks by IP
  const clicksByIp = link.clicks.reduce<Record<string, number>>(
    (acc, click) => {
      const ip = click.ip;
      acc[ip] = (acc[ip] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-medium">Link Details</h3>
        <div className="rounded-lg bg-white/5 p-4">
          <p className="mb-2">
            <span className="font-medium">Original URL:</span>{" "}
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {link.originalUrl}
            </a>
          </p>
          <p className="mb-2">
            <span className="font-medium">Short URL:</span>{" "}
            <a
              href={`/${link.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {`${window.location.origin}/${link.slug}`}
            </a>
          </p>
          <p>
            <span className="font-medium">Total Clicks:</span>{" "}
            {link._count.clicks}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Clicks by Date</h3>
        <div className="grid gap-2">
          {Object.entries(clicksByDate)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([date, count]) => (
              <div
                key={date}
                className="flex items-center justify-between rounded-lg bg-white/5 p-4"
              >
                <span>{date}</span>
                <span>{count} clicks</span>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Top User Agents</h3>
        <div className="grid gap-2">
          {Object.entries(clicksByUserAgent)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([userAgent, count]) => (
              <div
                key={userAgent}
                className="flex items-center justify-between rounded-lg bg-white/5 p-4"
              >
                <span className="max-w-[70%] truncate">{userAgent}</span>
                <span>{count} clicks</span>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Top Locations</h3>
        <div className="grid gap-2">
          {Object.entries(clicksByIp)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ip, count]) => (
              <div
                key={ip}
                className="flex items-center justify-between rounded-lg bg-white/5 p-4"
              >
                <span>{ip}</span>
                <span>{count} clicks</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
