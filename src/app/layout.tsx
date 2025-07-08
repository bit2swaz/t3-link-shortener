import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/context/AuthContext";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  title: "T3 Link Shortener",
  description: "Shorten. Share. Track.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} dark`}
      suppressHydrationWarning
    >
      <body>
        <AuthProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
