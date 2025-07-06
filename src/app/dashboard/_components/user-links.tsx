"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import Link from "next/link";

export function UserLinks() {
  const [editingLink, setEditingLink] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  const { data: links, refetch } = api.link.getUserLinks.useQuery();

  const deleteLink = api.link.delete.useMutation({
    onSuccess: () => {
      toast.success("Link deleted successfully");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateLink = api.link.update.useMutation({
    onSuccess: () => {
      toast.success("Link updated successfully");
      setEditingLink(null);
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!links?.length) {
    return (
      <div className="text-center text-zinc-200">
        <p>You haven&apos;t created any links yet.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="outline" className="bg-white/10">
            Create Your First Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-center justify-between rounded-lg bg-white/5 p-4"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {editingLink?.id === link.id ? (
                <Input
                  value={editingLink.slug}
                  onChange={(e) =>
                    setEditingLink({ id: link.id, slug: e.target.value })
                  }
                  className="bg-white/5"
                />
              ) : (
                <p className="font-medium text-white">{link.slug}</p>
              )}
              <span className="text-sm text-zinc-400">
                ({link._count.clicks} clicks)
              </span>
            </div>
            <p className="text-sm text-zinc-400">{link.originalUrl}</p>
          </div>

          <div className="ml-4 flex items-center gap-2">
            {editingLink?.id === link.id ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateLink.mutate({
                      id: link.id,
                      slug: editingLink.slug,
                    });
                  }}
                  disabled={updateLink.isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLink(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        `${window.location.origin}/${link.slug}`,
                      );
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingLink({ id: link.id, slug: link.slug });
                    }}
                  >
                    Edit Slug
                  </DropdownMenuItem>
                  <Link href={`/analytics/${link.id}`}>
                    <DropdownMenuItem>View Analytics</DropdownMenuItem>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-red-500">
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Link</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this link? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteLink.mutate({ id: link.id })}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
