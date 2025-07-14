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

type ExpiryOption =
  | "1_day"
  | "1_week"
  | "1_month"
  | "3_months"
  | "1_year"
  | "never";

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
  const [expiry, setExpiry] = useState<ExpiryOption>("1_day");
  const [loading, setLoading] = useState<boolean>(false);
  const [slugStatus, setSlugStatus] = useState<"available" | "taken" | null>(
    null,
  );

  const checkSlugAvailabilityMutation = api.link.checkSlugAvailability.useQuery(
    { slug: customSlug },
    {
      enabled: !!customSlug, // Only run when customSlug is not empty
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (customSlug) {
        void checkSlugAvailabilityMutation.refetch(); // Just trigger refetch
      } else {
        setSlugStatus(null);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [customSlug, checkSlugAvailabilityMutation]);

  // Update slugStatus based on the data from the query
  useEffect(() => {
    if (checkSlugAvailabilityMutation.data) {
      setSlugStatus(
        checkSlugAvailabilityMutation.data.isAvailable ? "available" : "taken",
      );
    } else if (checkSlugAvailabilityMutation.isError) {
      setSlugStatus(null); // Or 'error' if you want to explicitly show an error state
    }
  }, [
    checkSlugAvailabilityMutation.data,
    checkSlugAvailabilityMutation.isError,
  ]);

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
    onError: (error) => {
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
      className="animate-fade-in-up space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-md"
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
          className="animate-pop-in mt-1 rounded-md border-neutral-700 bg-neutral-800 text-neutral-50 shadow-sm transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500"
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
          className="animate-pop-in mt-1 rounded-md border-neutral-700 bg-neutral-800 text-neutral-50 shadow-sm transition-all delay-100 duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500"
        />
        {customSlug.length > 0 && slugStatus === "available" && (
          <p className="animate-fade-in mt-2 text-sm text-green-500">
            Slug is available!
          </p>
        )}
        {customSlug.length > 0 && slugStatus === "taken" && (
          <p className="animate-fade-in mt-2 text-sm text-red-500">
            Slug is taken.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="expiry" className="text-neutral-300">
          Expiry
        </Label>
        <Select
          value={expiry}
          onValueChange={(value: ExpiryOption) => setExpiry(value)}
        >
          <SelectTrigger className="animate-pop-in w-full rounded-md border-neutral-700 bg-neutral-800 text-neutral-50 shadow-sm transition-all delay-200 duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500">
            <SelectValue placeholder="Select expiry" />
          </SelectTrigger>
          <SelectContent className="animate-pop-in rounded-md border-neutral-700 bg-neutral-800 text-neutral-50 shadow-lg">
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
        className="animate-pop-in w-full bg-purple-600 text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-purple-700 active:scale-98"
        disabled={isShortenButtonDisabled}
      >
        {loading ? <Spinner /> : "Shorten URL"}
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
