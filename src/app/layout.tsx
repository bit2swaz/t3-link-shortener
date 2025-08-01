import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/context/AuthContext";
import { Toaster } from "~/components/ui/toaster";
import Footer from "~/components/Footer";

const inter = Inter({ subsets: ["latin"] });

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
      className={`${inter.className} dark`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans">
        <AuthProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster
            toastOptions={{
              className: "rounded-md shadow-lg animate-pop-in",
              style: {
                background: "#171717", // neutral-900
                color: "#f5f5f5", // neutral-50
              },
              success: {
                className: "rounded-md shadow-lg animate-pop-in",
                style: {
                  background: "#7C3AED", // purple-600
                  color: "#ffffff",
                },
              },
              error: {
                className: "rounded-md shadow-lg animate-pop-in",
                style: {
                  background: "#DC2626", // red-600
                  color: "#ffffff",
                },
              },
            }}
          />
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
