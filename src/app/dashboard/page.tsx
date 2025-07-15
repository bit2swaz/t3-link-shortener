/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
// import { type User } from "@supabase/supabase-js"; // Assuming User type from Supabase
import { useAuth } from "~/context/AuthContext";
import Navbar from "~/components/Navbar"; // Corrected import to default
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api, type RouterOutputs } from "~/trpc/react";
// import { type TRPCClientError } from "@trpc/client"; // Reverted import
// import { type AppRouter } from "~/server/api/root"; // Reverted import
import { Spinner } from "~/components/ui/spinner"; // Assuming a Spinner component
import ShortenForm from "~/components/ShortenForm";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loadingAuth, isAuthReady, setUser } = useAuth();
  const { toast } = useToast();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showLinkCreatedToast, setShowLinkCreatedToast] = useState(false);
  const [lastShortenedUrl, setLastShortenedUrl] = useState("");
  const [showRecoverModal, setShowRecoverModal] = useState(false); // New state for recovery modal
  const [recoverToken, setRecoverToken] = useState(""); // New state for recovery token input
  const [recovering, setRecovering] = useState(false); // New state for recovery loading state

  const utils = api.useUtils();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // const fetchLinks = async () => {
  //   try {
  //     const { data } = await api.link.getAll.query();
  //     if (data) {
  //       setShortenedLinks(data);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch links:", error);
  //     toast({
  //       title: "Error fetching links",
  //       description: "Failed to load your shortened links. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (isAuthReady && user) {
  //     void fetchLinks();
  //   }
  // }, [isAuthReady, user, fetchLinks]);

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    refetch: refetchUserProfile,
  } = api.user.getProfile.useQuery(
    undefined, // No input needed for getProfile
    {
      enabled: !!user?.id, // Only fetch if user is authenticated
    },
  );

  const {
    data: shortenedLinks,
    isLoading: isLoadingLinks,
    isError: isErrorLinks,
    error: linksError,
  } = api.link.getAll.useQuery(
    undefined, // No input needed for getAll
    {
      enabled: !!user?.id, // Only fetch if user is authenticated
    },
  );

  useEffect(() => {
    if (isErrorLinks && linksError) {
      toast({
        title: "Error fetching links",
        description: `Failed to load your shortened links: ${linksError.message}`,
        variant: "destructive",
      });
    }
  }, [isErrorLinks, linksError, toast]);

  const resetDailyCountMutation = api.user.resetDailyCount.useMutation({
    onSuccess: () => {
      void refetchUserProfile(); // Refetch user profile after reset
    },
    onError: (error) => {
      toast({
        title: "Error resetting daily count",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (userProfile?.lastShortenDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(userProfile.lastShortenDate).getTime() < today.getTime()) {
        void resetDailyCountMutation.mutateAsync();
      }
    }
  }, [userProfile?.lastShortenDate, resetDailyCountMutation]);

  const lifetimeLimit = 100; // Example limit, consider making this configurable
  const dailyLimit = 10; // Example limit, consider making this configurable

  const linkLimitExceeded =
    (userProfile?.totalLinksCreated ?? 0) >= lifetimeLimit;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyLimitExceeded =
    (userProfile?.dailyShortenCount ?? 0) >= dailyLimit &&
    !!userProfile?.lastShortenDate &&
    new Date(userProfile.lastShortenDate).toDateString() ===
      today.toDateString();

  const updateUsernameMutation = api.user.updateUsername.useMutation({
    onSuccess: (_data: RouterOutputs["user"]["updateUsername"]) => {
      if (user) {
        setUser({ ...user, username: newUsername });
        localStorage.setItem("t3-link-shortener-username", newUsername);
        toast({
          title: `Welcome, ${newUsername}!`,
          variant: "default",
        });
        setShowUsernameModal(false);
      }
    },
    onError: (error) => {
      toast({
        title: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { isPending: isUsernameUpdating } = updateUsernameMutation;

  const handleCopyToken = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        toast({
          title: "Token copied to clipboard!",
          variant: "default",
        });
      } catch (err) {
        console.error("Failed to copy token:", err);
        toast({
          title: "Could not copy token to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveUsername = () => {
    if (newUsername.trim() && user?.id) {
      updateUsernameMutation.mutate({ username: newUsername.trim() });
    }
  };

  const handleLinkShortened = (shortUrl: string) => {
    // Optionally update user profile data here, or refetch
    // For now, let's just refetch the profile to update counts
    void utils.user.getProfile.invalidate();
    setLastShortenedUrl(shortUrl);
    setShowLinkCreatedToast(true);
    toast({
      title: `Your short link: ${shortUrl}`,
      variant: "default",
    });
  };

  const handleRecoverAccount = async () => {
    setRecovering(true);
    if (recoverToken.trim() === "") {
      toast({
        title: "Please enter a token.",
        variant: "destructive",
      });
      setRecovering(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await (api.user.recoverAccount as any).mutate({ oldToken: recoverToken });
      toast({
        title: "Account recovered and links merged!",
        variant: "default",
      });
      setShowRecoverModal(false);
      setRecoverToken("");
      // Trigger data refresh
      void utils.link.getAll.invalidate(); // Refresh links
      void utils.user.getProfile.invalidate(); // Refresh user profile (for link limits)
    } catch (error: unknown) {
      toast({
        title: "Failed to recover account.",
        description:
          error instanceof Error ? error.message : "Please check the token.",
        variant: "destructive",
      });
    } finally {
      setRecovering(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && user && user.username === null && !showUsernameModal) {
      setShowUsernameModal(true);
    }
  }, [isAuthReady, user, showUsernameModal]);

  if (loadingAuth || !isAuthReady || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-50">
        <Spinner className="h-8 w-8 text-purple-600" />
        <p className="ml-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="animate-fade-in-up container mx-auto min-h-screen py-10 text-neutral-50">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-purple-600 sm:text-4xl">
            Welcome, {user?.username ?? "Guest"}!
          </h1>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowRecoverModal(true)}
              variant="outline"
              size="sm"
              className="animate-pulse-subtle rounded-full border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-purple-400 hover:text-purple-400"
            >
              ?
            </Button>
            {user?.id && (
              <Button
                onClick={handleCopyToken}
                variant="outline"
                size="sm"
                className="animate-wobble-hover rounded-full border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-purple-400 hover:text-purple-400"
              >
                Copy Token
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="animate-fade-in-left rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
            <ShortenForm
              onLinkShortened={handleLinkShortened}
              linkLimitExceeded={linkLimitExceeded}
              dailyLimitExceeded={dailyLimitExceeded}
            />
          </section>

          <section className="animate-fade-in-right rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-semibold text-neutral-50">
              Your Shortened Links
            </h3>
            {isLoadingLinks ? (
              <div className="flex items-center justify-center py-10">
                <Spinner />
                <p className="ml-3 text-neutral-400">Loading links...</p>
              </div>
            ) : shortenedLinks && shortenedLinks.length > 0 ? (
              <ul className="space-y-4">
                {shortenedLinks.map((link) => (
                  <li
                    key={link.id}
                    className={`animate-fade-in group flex flex-col items-start justify-between rounded-md border border-neutral-700 bg-neutral-800 p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:flex-row sm:items-center ${
                      link.expiresAt && new Date(link.expiresAt) < new Date()
                        ? "text-neutral-500 line-through opacity-60"
                        : ""
                    }`}
                  >
                    <div className="mb-2 flex-grow sm:mb-0">
                      <p className="text-sm text-neutral-400">
                        Original:{" "}
                        <a
                          href={link.longUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 underline hover:text-purple-300"
                        >
                          {link.longUrl.length > 50
                            ? `${link.longUrl.substring(0, 50)}...`
                            : link.longUrl}
                        </a>
                      </p>
                      <p className="text-lg font-semibold text-neutral-50">
                        Short:{" "}
                        <Link
                          href={`/s/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline"
                        >
                          {`${window.location.origin}/s/${link.shortCode}`}
                        </Link>
                      </p>
                      <p className="text-xs text-neutral-500">
                        Clicks: {link.clicks} |
                        {link.expiresAt
                          ? ` Expires: ${new Date(link.expiresAt).toLocaleDateString()}`
                          : " Never expires"}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        void handleCopy(
                          `${window.location.origin}/s/${link.shortCode}`,
                        )
                      }
                      variant="secondary"
                      size="sm"
                      className="ml-0 shrink-0 bg-neutral-700 text-neutral-50 transition-all duration-200 hover:bg-purple-600 hover:text-white sm:ml-4"
                    >
                      Copy
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-neutral-400">
                You haven&apos;t shortened any links yet.
              </p>
            )}
          </section>
        </div>

        {/* Username Modal */}
        <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
          <DialogContent className="border border-neutral-800 bg-neutral-900 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-neutral-50">
                Choose a Username
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                Pick a username to get started. You can change it later.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Your username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="border-neutral-700 bg-neutral-800 text-neutral-50 transition-all duration-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <DialogFooter>
              <Button
                onClick={handleSaveUsername}
                disabled={isUsernameUpdating}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {isUsernameUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> Saving...
                  </>
                ) : (
                  "Save Username"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recovery Account Modal */}
        <Dialog open={showRecoverModal} onOpenChange={setShowRecoverModal}>
          <DialogContent className="border border-neutral-800 bg-neutral-900 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-neutral-50">
                Recover Account
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                Enter your old token to recover your account and links. Your
                current links will be merged.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Paste your old token here"
              value={recoverToken}
              onChange={(e) => setRecoverToken(e.target.value)}
              className="border-neutral-700 bg-neutral-800 text-neutral-50 transition-all duration-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <DialogFooter>
              <Button
                onClick={handleRecoverAccount}
                disabled={recovering}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {recovering ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Recovering...
                  </>
                ) : (
                  "Recover"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* Shortened URL Dialog/Toast */}
      <Dialog
        open={showLinkCreatedToast}
        onOpenChange={setShowLinkCreatedToast}
      >
        <DialogContent className="animate-pop-in relative z-50 w-full max-w-lg rounded-lg border bg-neutral-900 p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle>Your Shortened URL!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <a
              href={lastShortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium break-all text-purple-400 underline hover:text-purple-500"
            >
              {lastShortenedUrl}
            </a>
            <Button
              onClick={() => {
                void navigator.clipboard.writeText(lastShortenedUrl);
                toast({
                  title: "Short URL copied to clipboard!",
                  variant: "default",
                });
              }}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Copy Short URL
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowLinkCreatedToast(false)}
              className="bg-neutral-700 text-neutral-50 hover:bg-neutral-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
