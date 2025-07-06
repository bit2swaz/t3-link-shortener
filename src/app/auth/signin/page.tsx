import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="mt-8 space-y-4">
          <Button className="w-full" asChild>
            <Link href="/api/auth/signin/github">Sign in with GitHub</Link>
          </Button>

          <Button className="w-full" asChild variant="outline">
            <Link href="/api/auth/signin/google">Sign in with Google</Link>
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            This is a placeholder page. The actual login form will be implemented later.
          </p>
        </div>
      </div>
    </div>
  );
}
