"use client";

import { useEffect, useRef } from "react";

import React from "react";
import { ToastContent } from "../ToastContent";
import { toast } from "sonner";

interface UseTransactionToastProps {
  transactionSignature: string | null;
}

/**
 * A hook that displays a toast when a transaction signature is available.
 */
export function useTransactionToast({
  transactionSignature,
}: UseTransactionToastProps) {
  const toastIdRef = useRef<string | number | null>(null);

  // Display toast when transaction signature is available
  useEffect(() => {
    if (transactionSignature) {
      const explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`;

      // Dismiss previous toast if exists
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      // Create toast with custom component that manages its own state
      toastIdRef.current = toast.success("Транзакция отправлена!", {
        description: (
          <ToastContent
            transactionSignature={transactionSignature}
            explorerUrl={explorerUrl}
          />
        ),
        style: {
          color: "#0f172a",
          backgroundColor: "#ffffff",
          border: "1px solid #86efac",
          boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.18)",
        },
        duration: 8000,
      });
    }
  }, [transactionSignature]);
}
