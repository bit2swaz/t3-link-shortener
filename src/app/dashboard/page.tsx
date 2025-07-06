import { Suspense } from "react";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UserLinks } from "./_components/user-links";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-zinc-200">
            Manage your shortened links and view analytics
          </p>
        </div>

        <Card className="bg-white/10">
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription className="text-zinc-200">
              View and manage all your shortened links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading your links...</div>}>
              <UserLinks />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
