"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="animate-fade-in-up flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="animate-pop-in w-full rounded-full bg-neutral-800 px-4 py-2 text-neutral-50 shadow-sm transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="animate-pop-in rounded-full bg-purple-600 px-10 py-3 font-semibold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-purple-700 active:scale-98"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
