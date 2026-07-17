"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useProgram } from "./hooks/useProgram";
import { useTransactionToast } from "./hooks/useTransactionToast";

/**
 * IncrementButton component that handles its own transaction logic
 * for incrementing the counter.
 */
export function IncrementButton() {
  // Get program and wallet information from the hook
  const { program, publicKey, connected } = useProgram();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);

  // Use transaction toast hook
  useTransactionToast({ transactionSignature });

  // Handle increment button click
  const handleIncrement = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);

      // Send the transaction
      const txSignature = await program.methods
        .increment()
        .accounts({
          user: publicKey,
        })
        .rpc();

      setTransactionSignature(txSignature);
    } catch (err) {
      console.error("Error incrementing counter:", err);
      toast.error("Transaction Failed", {
        description: `${err}`,
        style: {
          color: "#7f1d1d",
          border: "1px solid #fca5a5",
          background: "#fef2f2",
        },
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleIncrement}
      disabled={isLoading || !connected}
      className="h-11 w-full bg-emerald-700 text-base font-bold text-white shadow-md hover:bg-emerald-800"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
          <span>Processing...</span>
        </div>
      ) : (
        "Increment Counter"
      )}
    </Button>
  );
}
