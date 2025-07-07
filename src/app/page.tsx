import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <h1 className="text-4xl font-bold">T3 Link Shortener</h1>
        <p className="text-lg text-muted-foreground">A link shortener built with the T3 stack</p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button asChild variant="default">
            <Link href="/shorten">Shorten a URL</Link>
          </Button>

          <Button asChild variant="default">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>

        <div className="mt-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Features</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Shorten links anonymously</li>
            <li>✓ Create custom slugs</li>
            <li>✓ Track click counts</li>
            <li>✓ User dashboard with link history</li>
            <li>✓ Multiple authentication methods</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
