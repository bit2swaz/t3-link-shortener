import { Suspense } from "react";
import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { CreateLinkForm } from "./_components/create-link-form";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Link <span className="text-[hsl(280,100%,70%)]">Shortener</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-8">
          <Card className="bg-white/10 p-4">
            <CardHeader>
              <CardTitle>Shorten Your Link</CardTitle>
              <CardDescription className="text-zinc-200">
                Create a short link that's easy to share and track
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading...</div>}>
                <CreateLinkForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-2">
          {session ? (
            <Link href="/dashboard">
              <Button variant="outline" className="bg-white/10">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline" className="bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="bg-white/10">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
