"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React from "react";
import dynamic from "next/dynamic";

import { NETWORK_LABELS, SOLANA_NETWORK } from "@/lib/solana-config";

// Nextjs hydration error fix
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  {
    ssr: false,
    loading: () => {
      return (
        <div
          className="flex animate-pulse items-center rounded-md border border-emerald-400/20 bg-[#07110f]"
          style={{
            width: "173.47px",
            height: "48px",
            padding: "0 12px",
            gap: "8px",
          }}
        >
          <div
            className="rounded-full bg-emerald-300/30"
            style={{ width: "24px", height: "24px" }}
          ></div>
          <div
            className="h-4 bg-white/10 rounded-sm"
            style={{ width: "100px" }}
          ></div>
        </div>
      );
    },
  }
);

export function WalletButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <WalletMultiButton />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{NETWORK_LABELS[SOLANA_NETWORK]} Only</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
