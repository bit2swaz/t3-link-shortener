import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ToastProvider } from "~/components/toast-provider";
import { SessionProvider } from "../components/session-provider";

export const metadata: Metadata = {
  title: "T3 Link Shortener",
  description: "A powerful link shortener built with the T3 stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            {children}
            <ToastProvider />
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
