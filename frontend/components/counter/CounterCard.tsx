"use client";

import { CounterDisplay } from "./CounterDisplay";
import { CreateTokenForm } from "./CreateTokenForm";
import { DecrementButton } from "./DecrementButton";
import { IncrementButton } from "./IncrementButton";
import { useState } from "react";
import { WalletButton } from "./WalletButton";
import { WalletInfo } from "./WalletInfo";

/**
 * CounterCard is the main component for the Counter dApp.
 * It provides a user interface for interacting with a Solana counter program.
 */
export function CounterCard() {
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);

  return (
    <div
      className={`relative z-10 mx-auto grid w-full items-start gap-6 transition-[max-width] duration-300 ${
        isTokenFormOpen
          ? "max-w-[780px] lg:grid-cols-2"
          : "max-w-[360px] grid-cols-1"
      }`}
    >
      <section className="relative isolate w-full overflow-visible rounded-2xl border-2 border-slate-300 bg-white px-7 py-8 shadow-xl shadow-slate-300/50">
        <div className="relative z-10 flex flex-col items-center gap-6">
          <WalletButton />
          <WalletInfo />
          <CounterDisplay />
          <div className="flex w-full flex-col items-center gap-3">
            <IncrementButton />
            <DecrementButton />
            <button
              type="button"
              onClick={() => setIsTokenFormOpen(true)}
              aria-expanded={isTokenFormOpen}
              className="h-11 w-full rounded-md border-2 border-violet-700 bg-violet-50 text-base font-bold text-violet-950 shadow-sm transition-colors hover:bg-violet-100"
            >
              Создать крипту
            </button>
          </div>
        </div>
      </section>

      {isTokenFormOpen && (
        <section className="animate-in fade-in slide-in-from-left-4 w-full rounded-2xl border-2 border-slate-300 bg-white px-7 py-8 shadow-xl shadow-slate-300/50 duration-300">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-950">
              Создание Token-2022
            </h2>
            <button
              type="button"
              onClick={() => setIsTokenFormOpen(false)}
              aria-label="Закрыть форму создания токена"
              className="flex size-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-xl font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              ×
            </button>
          </div>
          <CreateTokenForm />
        </section>
      )}
    </div>
  );
}
