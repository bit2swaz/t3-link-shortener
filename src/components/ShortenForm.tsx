/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/trpc/react";
import { Spinner } from "./ui/spinner"; // Assuming a Spinner component exists

interface ShortenFormProps {
  onLinkShortened: (shortUrl: string) => void;
  linkLimitExceeded: boolean;
  dailyLimitExceeded: boolean;
}

const ShortenForm: React.FC<ShortenFormProps> = ({
  onLinkShortened,
  linkLimitExceeded,
  dailyLimitExceeded,
}) => {
  const { toast } = useToast();
  const [longUrl, setLongUrl] = useState<string>("");
  const [customSlug, setCustomSlug] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("1_day");
  const [loading, setLoading] = useState<boolean>(false);
  const [slugStatus, setSlugStatus] = useState<"available" | "taken" | null>(
    null,
  );

  const checkSlugAvailabilityMutation = api.link.checkSlugAvailability.useQuery(
    { slug: customSlug },
    {
      enabled: !!customSlug,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (customSlug) {
        checkSlugAvailabilityMutation
          .refetch()
          .then((result: { data: { isAvailable: any } }) => {
            if (result.data) {
              setSlugStatus(result.data.isAvailable ? "available" : "taken");
            }
          })
          .catch(() => {
            setSlugStatus(null); // Or 'error' if you want to explicitly show an error state
          });
      } else {
        setSlugStatus(null);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [customSlug, checkSlugAvailabilityMutation]);

  const createLinkMutation = api.link.create.useMutation({
    onSuccess: (data: { shortUrl: string }) => {
      onLinkShortened(data.shortUrl);
      setLongUrl("");
      setCustomSlug("");
      setExpiry("1_day");
      setSlugStatus(null);
      toast({
        title: "Link shortened successfully!",
        description: data.shortUrl,
      });
    },
    onError: (error: { message: any }) => {
      toast({
        title: "Error shortening link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (linkLimitExceeded) {
      toast({
        title: "Link Limit Exceeded",
        description: "You have reached your lifetime link creation limit.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (dailyLimitExceeded) {
      toast({
        title: "Daily Limit Exceeded",
        description: "You have reached your daily link creation limit.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (customSlug && slugStatus === "taken") {
      toast({
        title: "Custom Slug Taken",
        description: "The custom slug you entered is already taken.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await createLinkMutation.mutateAsync({
        longUrl,
        shortCode: customSlug || undefined,
        expiryOption: expiry,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""); // Allow only lowercase letters, numbers, and hyphens
    setCustomSlug(value);
  };

  const isShortenButtonDisabled =
    loading ||
    (customSlug.length > 0 && slugStatus === "taken") ||
    linkLimitExceeded ||
    dailyLimitExceeded;

  return (
    <form
      onSubmit={handleShorten}
      className="space-y-6 rounded-md bg-neutral-800 p-6 shadow-lg"
    >
      <h3 className="mb-4 text-2xl font-semibold text-neutral-50">
        Shorten a New URL
      </h3>

      <div>
        <Label htmlFor="longUrl" className="text-neutral-300">
          Long URL
        </Label>
        <Input
          id="longUrl"
          type="url"
          placeholder="https://example.com/very/long/url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          className="mt-1 rounded-md border-neutral-600 bg-neutral-700 text-neutral-50 focus:border-purple-600"
        />
      </div>

      <div>
        <Label htmlFor="customSlug" className="text-neutral-300">
          Custom Slug (optional)
        </Label>
        <Input
          id="customSlug"
          type="text"
          placeholder="my-cool-link"
          value={customSlug}
          onChange={handleCustomSlugChange}
          className="mt-1 rounded-md border-neutral-600 bg-neutral-700 text-neutral-50 focus:border-purple-600"
        />
        {customSlug.length > 0 && slugStatus === "available" && (
          <p className="mt-1 text-sm text-green-500">Slug is available!</p>
        )}
        {customSlug.length > 0 && slugStatus === "taken" && (
          <p className="mt-1 text-sm text-red-500">Slug is taken.</p>
        )}
      </div>

      <div>
        <Label htmlFor="expiry" className="text-neutral-300">
          Expiry
        </Label>
        <Select value={expiry} onValueChange={setExpiry}>
          <SelectTrigger className="mt-1 rounded-md border-neutral-600 bg-neutral-700 text-neutral-50 focus:border-purple-600">
            <SelectValue placeholder="Select expiry" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-700 text-neutral-50">
            <SelectItem value="1_day">1 Day</SelectItem>
            <SelectItem value="1_week">1 Week</SelectItem>
            <SelectItem value="1_month">1 Month</SelectItem>
            <SelectItem value="3_months">3 Months</SelectItem>
            <SelectItem value="1_year">1 Year</SelectItem>
            <SelectItem value="never">Never</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full rounded-md bg-purple-600 py-2 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-purple-700"
        disabled={isShortenButtonDisabled}
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" /> Shortening...
          </>
        ) : (
          "Shorten URL"
        )}
      </Button>

      {linkLimitExceeded && (
        <p className="text-center text-red-500">
          You have reached your lifetime link creation limit.
        </p>
      )}
      {dailyLimitExceeded && (
        <p className="text-center text-red-500">
          You have reached your daily link creation limit.
        </p>
      )}
    </form>
  );
};

export default ShortenForm;
