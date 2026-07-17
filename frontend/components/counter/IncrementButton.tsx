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
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background:
            "linear-gradient(to right, rgba(40, 27, 27, 0.95), rgba(28, 23, 23, 0.95))",
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
      className="h-11 w-[85%] bg-gradient-to-r from-emerald-600 to-teal-500 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-950/30 hover:from-emerald-500 hover:to-teal-400"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950"></div>
          <span>Processing...</span>
        </div>
      ) : (
        "Increment Counter"
      )}
    </Button>
  );
}
