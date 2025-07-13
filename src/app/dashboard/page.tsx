/* eslint-disable @typescript-eslint/no-unsafe-call */

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
// import { type TRPCClientError } from "@trpc/client"; // Reverting import
// import { type AppRouter } from "~/server/api/root"; // Reverting import
import { Spinner } from "~/components/ui/spinner"; // Assuming a Spinner component
import ShortenForm from "~/components/ShortenForm";

export default function DashboardPage() {
  const { user, loadingAuth, isAuthReady, setUser } = useAuth();
  const { toast } = useToast();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameFromLocalStorage, setUsernameFromLocalStorage] = useState<
    string | null
  >(null);
  const [showLinkCreatedToast, setShowLinkCreatedToast] = useState(false);
  const [lastShortenedUrl, setLastShortenedUrl] = useState("");
  const [showRecoverModal, setShowRecoverModal] = useState(false); // New state for recovery modal
  const [recoverToken, setRecoverToken] = useState(""); // New state for recovery token input
  const [recovering, setRecovering] = useState(false); // New state for recovery loading state
  // const [shortenedLinks, setShortenedLinks] = useState<
  //   {
  //     id: string;
  //     longUrl: string;
  //     shortCode: string;
  //     clicks: number;
  //     createdAt: Date;
  //     expiresAt: Date | null;
  //   }[]
  // >([]);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("t3-link-shortener-username");
      if (storedUsername) {
        setUsernameFromLocalStorage(storedUsername);
      }
    }
  }, []);

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
      await api.user.recoverAccount.mutate({ oldToken: recoverToken });
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

  // Show username modal if user is ready and has no username AND no username in local storage
  if (
    isAuthReady &&
    user &&
    user.username === null &&
    !usernameFromLocalStorage &&
    !showUsernameModal
  ) {
    setShowUsernameModal(true);
  }

  if (loadingAuth || !isAuthReady || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-50">
        <Spinner className="h-8 w-8 text-purple-600" />
        <p className="ml-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            Welcome, {user?.username ?? usernameFromLocalStorage ?? "Guest"}!
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleCopyToken}
              className="rounded-md bg-purple-600 text-neutral-50 hover:bg-purple-700"
            >
              Copy Token
            </Button>
            <Button
              onClick={() => setShowRecoverModal(true)} // New Recover Account Button
              className="rounded-md bg-purple-600 text-neutral-50 hover:bg-purple-700"
            >
              Recover Account
            </Button>
            <span
              onClick={() =>
                toast({
                  title:
                    "Your token allows you to recover your account and links on other devices.",
                  variant: "default",
                })
              }
              className="cursor-pointer text-purple-600 hover:text-purple-700"
            >
              ?
            </span>
          </div>
        </div>

        {/* Recovery Account Modal */}
        <Dialog open={showRecoverModal} onOpenChange={setShowRecoverModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recover Account</DialogTitle>
              <DialogDescription>
                Enter your old token to recover your account and links. Your
                current links will be merged.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Paste your old token here"
              value={recoverToken}
              onChange={(e) => setRecoverToken(e.target.value)}
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

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-md bg-neutral-800 p-6 shadow-lg">
            <h3 className="mb-4 text-2xl font-semibold text-neutral-50">
              Shorten a New URL
            </h3>
            <ShortenForm
              onLinkShortened={handleLinkShortened}
              linkLimitExceeded={linkLimitExceeded}
              dailyLimitExceeded={dailyLimitExceeded}
            />
          </div>

          <div className="rounded-md bg-neutral-800 p-6 shadow-lg">
            <h3 className="mb-4 text-2xl font-semibold text-neutral-50">
              Your Shortened Links ({shortenedLinks?.length ?? 0}/
              {lifetimeLimit})
            </h3>
            {isLoadingLinks ? (
              <Spinner className="h-8 w-8 text-purple-600" />
            ) : (shortenedLinks?.length ?? 0) === 0 ? (
              <p className="text-neutral-300">
                No links shortened yet. Start by creating one!
              </p>
            ) : (
              <ul className="space-y-4">
                {(shortenedLinks ?? []).map((link) => {
                  const isExpired =
                    link.expiresAt && new Date(link.expiresAt) < new Date();
                  const linkClasses = `rounded-md bg-neutral-700 p-4 shadow-md transition-all duration-200 ease-in-out ${isExpired ? "opacity-50 line-through text-neutral-500" : "hover:bg-neutral-600"}`;
                  return (
                    <li key={link.id} className={linkClasses}>
                      <a
                        href={`${window.location.origin}/s/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-lg font-medium break-all text-purple-400 hover:underline"
                      >
                        {`${window.location.origin}/s/${link.shortCode}`}
                      </a>
                      <p className="max-w-xs truncate text-sm text-neutral-400">
                        {link.longUrl}
                      </p>
                      {link.expiresAt && (
                        <p className="text-xs text-neutral-500">
                          Expires:{" "}
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500">
                        Clicks: {link.clicks || 0}
                      </p>
                      <Button
                        onClick={() =>
                          toast({
                            title: "Link Analytics",
                            description: `Clicks for ${link.shortCode}: ${link.clicks || 0}`,
                            variant: "default",
                          })
                        }
                        className="mt-2 rounded-md bg-purple-600 text-xs text-neutral-50 hover:bg-purple-700"
                      >
                        View Analytics
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
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

      {/* Username Prompt Dialog */}
      <Dialog
        open={
          showUsernameModal &&
          user?.username === null &&
          !usernameFromLocalStorage
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to T3 Link Shortener!</DialogTitle>
            <DialogDescription>
              What would you like us to call you? This username will be
              displayed on your dashboard.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Enter your username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="mt-4 rounded-md border-neutral-600 bg-neutral-700 text-neutral-50 focus:border-purple-600"
          />
          <Button
            onClick={handleSaveUsername}
            className="mt-4 rounded-md bg-purple-600 text-neutral-50 hover:bg-purple-700"
            disabled={isUsernameUpdating}
          >
            {isUsernameUpdating ? "Saving..." : "Save Username"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
