"use client";

import { toast as hotToast } from "react-hot-toast";

// No longer need ToastProps interface as we're using hotToast directly

export const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      const message = title ?? ""; // Use nullish coalescing
      const fullMessage = description ? `${message}: ${description}` : message; // Combine title and description

      if (variant === "destructive") {
        hotToast.error(fullMessage);
      } else {
        hotToast.success(fullMessage);
      }
    },
  };
};
