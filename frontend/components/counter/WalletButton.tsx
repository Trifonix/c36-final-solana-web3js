"use client";

import React from "react";
import dynamic from "next/dynamic";

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
          className="flex animate-pulse items-center rounded-md border border-slate-300 bg-slate-100"
          style={{
            width: "173.47px",
            height: "48px",
            padding: "0 12px",
            gap: "8px",
          }}
        >
          <div
            className="rounded-full bg-emerald-700/30"
            style={{ width: "24px", height: "24px" }}
          ></div>
          <div
            className="h-4 rounded-sm bg-slate-300"
            style={{ width: "100px" }}
          ></div>
        </div>
      );
    },
  }
);

export function WalletButton() {
  return <WalletMultiButton />;
}
