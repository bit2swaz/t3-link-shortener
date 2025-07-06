import { Suspense } from "react";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { LinkAnalytics } from "./_components/link-analytics";

export default async function AnalyticsPage({
  params,
}: {
  params: { linkId: string };
}) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Link Analytics</h1>
          <p className="mt-2 text-zinc-200">
            View detailed statistics for your link
          </p>
        </div>

        <Card className="bg-white/10">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription className="text-zinc-200">
              Track clicks, locations, and user agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading analytics...</div>}>
              <LinkAnalytics linkId={params.linkId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
