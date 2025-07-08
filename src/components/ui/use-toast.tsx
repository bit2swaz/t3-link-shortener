"use client";

import { toast as hotToast } from "react-hot-toast";

// No longer need ToastProps interface as we're using hotToast directly

export const useToast = () => {
  return {
    toast: hotToast,
    // You can also expose other hotToast methods directly if needed
    // success: hotToast.success,
    // error: hotToast.error,
    // loading: hotToast.loading,
    // custom: hotToast.custom,
  };
};
