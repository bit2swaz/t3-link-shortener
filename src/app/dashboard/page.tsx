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
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Navbar />
      <main className="container mx-auto flex-grow p-8">
        <h1 className="animate-slide-up mb-8 text-4xl font-bold text-neutral-50">
          Welcome to your Dashboard, {userProfile?.username ?? "User"}!
        </h1>

        <div className="mb-8 flex items-center justify-end space-x-4">
          <Button
            onClick={handleCopyToken}
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm text-neutral-200 transition-all duration-200 hover:scale-105 hover:bg-neutral-700 active:scale-98"
          >
            Copy Account Token
          </Button>
          <Button
            onClick={() => setShowRecoverModal(true)}
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm text-neutral-200 transition-all duration-200 hover:scale-105 hover:bg-neutral-700 active:scale-98"
          >
            Recover Account
            <span
              className="ml-2 cursor-help text-neutral-400 transition-colors duration-200 hover:text-purple-400"
              title="If you log in from a new device, use this token to recover your links."
            >
              ?
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="animate-fade-in rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-semibold text-neutral-50">
              Shorten a New Link
            </h2>
            <ShortenForm
              onLinkShortened={handleLinkShortened}
              linkLimitExceeded={linkLimitExceeded}
              dailyLimitExceeded={dailyLimitExceeded}
            />
          </div>

          <div className="animate-fade-in rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-semibold text-neutral-50">
              Your Shortened Links ({shortenedLinks?.length ?? 0}/
              {lifetimeLimit})
            </h2>
            {isLoadingLinks ? (
              <Spinner className="h-8 w-8 text-purple-600" />
            ) : shortenedLinks && shortenedLinks.length > 0 ? (
              <div className="space-y-4">
                {shortenedLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`flex transform items-center justify-between rounded-lg bg-neutral-800 p-5 transition-all duration-200 hover:scale-[1.01] hover:bg-neutral-700 hover:shadow-lg ${link.expiresAt && new Date(link.expiresAt) < new Date() ? "pointer-events-none text-neutral-500 line-through opacity-50" : ""}`}
                  >
                    <div>
                      <p className="font-semibold text-neutral-200">
                        {link.longUrl}
                      </p>
                      <Link href={`/s/${link.shortCode}`} passHref>
                        <span className="cursor-pointer text-purple-400 hover:underline">
                          {`${window.location.origin}/s/${link.shortCode}`}
                        </span>
                      </Link>
                      {link.expiresAt && (
                        <p className="text-xs text-neutral-400">
                          Expires:{" "}
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() =>
                        toast({
                          title: "View analytics for this link",
                          variant: "default",
                        })
                      }
                      className="rounded-md bg-neutral-700 px-3 py-1 text-xs text-neutral-200 transition-all duration-200 hover:scale-105 hover:bg-neutral-600 active:scale-98"
                    >
                      View Analytics
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-400">
                No links shortened yet. Shorten one now!
              </p>
            )}
          </div>
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
        <DialogContent className="animate-fade-in animate-slide-in-up">
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
              className="rounded-md bg-purple-600 text-neutral-50 hover:bg-purple-700"
            >
              Copy Short URL
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowLinkCreatedToast(false)}
              className="rounded-md bg-neutral-700 text-neutral-50 hover:bg-neutral-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
