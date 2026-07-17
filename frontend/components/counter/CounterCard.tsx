"use client";

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
    <section className="relative isolate mx-auto w-full max-w-[360px] overflow-visible rounded-2xl border-2 border-slate-300 bg-white px-7 py-8 shadow-xl shadow-slate-300/50">
      <div className="relative z-10 flex flex-col items-center gap-6">
        <WalletButton />
        <WalletInfo />
        <div className="flex w-full flex-col items-center gap-3">
          <IncrementButton />
          <DecrementButton />
        </div>
      </div>
    </section>
  );
}
