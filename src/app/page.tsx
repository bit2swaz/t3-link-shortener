import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <h1 className="text-4xl font-bold">T3 Link Shortener</h1>
        <p className="text-lg text-muted-foreground">A link shortener built with the T3 stack</p>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex flex-col items-center gap-4">
              <p>Logged in as {session.user?.email}</p>
              <Button asChild variant="outline">
                <Link href="/api/auth/signout">Sign out</Link>
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/api/auth/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
