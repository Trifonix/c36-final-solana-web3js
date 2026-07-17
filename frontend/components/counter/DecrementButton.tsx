"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useProgram } from "./hooks/useProgram";
import { useTransactionToast } from "./hooks/useTransactionToast";

/**
 * DecrementButton component that handles its own transaction logic
 * for decrementing the counter.
 */
export function DecrementButton() {
  // Get program and wallet information from the hook
  const { program, publicKey, connected } = useProgram();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);

  // Use transaction toast hook
  useTransactionToast({ transactionSignature });

  // Handle decrement button click
  const handleDecrement = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);

      // Send the transaction
      const txSignature = await program.methods
        .decrement()
        .accounts({
          user: publicKey,
        })
        .rpc();

      setTransactionSignature(txSignature);
    } catch (err) {
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
      onClick={handleDecrement}
      disabled={isLoading || !connected}
      className="h-11 w-full border-2 border-amber-700 bg-amber-100 text-base font-bold text-amber-950 shadow-sm hover:bg-amber-200"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-amber-950/30 border-t-amber-950"></div>
          <span>Processing...</span>
        </div>
      ) : (
        "Decrement Counter"
      )}
    </Button>
  );
}
