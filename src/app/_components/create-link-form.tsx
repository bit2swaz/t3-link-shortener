"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/trpc/react";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  slug: z.string().min(3).max(32).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateLinkForm() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      slug: "",
    },
  });

  const createLink = api.link.create.useMutation({
    onSuccess: (data) => {
      setShortUrl(`${window.location.origin}/${data.slug}`);
      toast.success("Link created successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    createLink.mutate({
      url: data.url,
      slug: data.slug || undefined,
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    className="bg-white/5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  Custom Slug (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="my-custom-link"
                    {...field}
                    className="bg-white/5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createLink.isLoading}
          >
            {createLink.isLoading ? "Creating..." : "Create Short Link"}
          </Button>
        </form>
      </Form>

      {shortUrl && (
        <div className="mt-4 rounded-lg bg-white/5 p-4">
          <p className="text-sm text-zinc-200">Your short link:</p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={shortUrl}
              readOnly
              className="bg-white/5"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={() => {
                void navigator.clipboard.writeText(shortUrl);
                toast.success("Copied to clipboard!");
              }}
              variant="outline"
              className="shrink-0"
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
