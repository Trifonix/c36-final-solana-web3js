"use client";

import { Card, CardContent } from "@/components/ui/card";

import { CounterDisplay } from "./CounterDisplay";
import { DecrementButton } from "./DecrementButton";
import { IncrementButton } from "./IncrementButton";
import React from "react";
import { WalletButton } from "./WalletButton";
import { WalletInfo } from "./WalletInfo";

/**
 * CounterCard is the main component for the Counter dApp.
 * It provides a user interface for interacting with a Solana counter program.
 */
export function CounterCard() {
  return (
    <Card className="relative isolate w-[350px] mx-auto overflow-visible border-emerald-400/20 bg-[#0b1b18]/85 backdrop-blur-xl shadow-2xl shadow-emerald-950/50 ring-1 ring-inset ring-white/[0.04]">
      <CardContent className="relative z-10 flex flex-col items-center py-6 space-y-6">
        <WalletButton />
        <WalletInfo />
        <CounterDisplay />
        <div className="flex flex-col w-full items-center space-y-3">
          <IncrementButton />
          <DecrementButton />
        </div>
      </CardContent>
    </Card>
  );
}
