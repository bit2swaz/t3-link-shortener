"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#363636",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        success: {
          style: {
            borderLeft: "4px solid #10b981",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid #ef4444",
          },
        },
      }}
    />
  );
}
