import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { LinkAnalytics } from "./_components/link-analytics";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function AnalyticsPage({
  params,
}: {
  params: { linkId: string };
}) {
  const { linkId } = params;
  const session = await auth();

  // Redirect to login if not logged in
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col gap-12 px-4 py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[3rem]">
            Link Analytics
          </h1>
          <Link href="/dashboard">
            <Button variant="outline" className="bg-white/10">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <LinkAnalytics linkId={linkId} />
      </div>
    </div>
  );
}
