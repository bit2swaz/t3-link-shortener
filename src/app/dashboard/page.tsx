/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api, type RouterOutputs } from "~/trpc/react";
// import { type TRPCClientError } from "@trpc/client";
// import { type AppRouter } from "~/server/api/root";
import { Spinner } from "~/components/ui/spinner"; // Assuming a Spinner component

export default function DashboardPage() {
  const { user, loadingAuth, isAuthReady, setUser } = useAuth();
  const { toast } = useToast();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameFromLocalStorage, setUsernameFromLocalStorage] = useState<
    string | null
  >(null);

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
        toast.success(`Welcome, ${newUsername}!`);
        setShowUsernameModal(false);
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const { isPending: isUsernameUpdating } = updateUsernameMutation;

  const handleCopyToken = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        toast.success("Token copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy token:", err);
        toast.error("Could not copy token to clipboard.");
      }
    }
  };

  const handleSaveUsername = () => {
    if (newUsername.trim() && user?.id) {
      updateUsernameMutation.mutate({ username: newUsername.trim() });
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

  if (loadingAuth || !isAuthReady) {
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
            <span
              onClick={() =>
                toast(
                  "Your token allows you to recover your account and links on other devices.",
                )
              }
              className="cursor-pointer text-purple-600 hover:text-purple-700"
            >
              ?
            </span>
            <Button
              disabled // Placeholder for Phase 6
              className="rounded-md bg-neutral-800 text-neutral-50 hover:bg-neutral-700"
            >
              Recover Account
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="rounded-md bg-neutral-800 p-6 shadow-lg">
            <h3 className="mb-4 text-2xl font-semibold text-neutral-50">
              Shorten a New URL
            </h3>
            <p className="text-neutral-300">
              {/* Placeholder for link shortening form */}
              Form goes here...
            </p>
          </div>

          <div className="rounded-md bg-neutral-800 p-6 shadow-lg">
            <h3 className="mb-4 text-2xl font-semibold text-neutral-50">
              Your Shortened Links
            </h3>
            <p className="text-neutral-300">
              {/* Placeholder for list of shortened links */}
              Links list goes here...
            </p>
          </div>
        </div>
      </main>

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
