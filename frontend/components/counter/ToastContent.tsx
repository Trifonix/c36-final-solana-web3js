"use client";

import { Check, ClipboardCopy } from "lucide-react";
import React, { MouseEvent, useState } from "react";

import { Button } from "@/components/ui/button";

interface ToastContentProps {
  transactionSignature: string;
  explorerUrl: string;
}

export function ToastContent({
  transactionSignature,
  explorerUrl,
}: ToastContentProps) {
  const [isContentCopied, setIsContentCopied] = useState(false);

  const handleContentCopy = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(transactionSignature);
    setIsContentCopied(true);
    setTimeout(() => setIsContentCopied(false), 500);
  };

  return (
    <div className="mt-2">
      <div className="mb-3 overflow-auto rounded border border-slate-300 bg-slate-100 p-1.5 font-mono text-xs text-slate-950">
        {transactionSignature}
      </div>
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className={`h-8 px-2 text-xs flex-1 ${
            isContentCopied
              ? "border-emerald-700 bg-emerald-100 text-emerald-950"
              : "border-slate-400 bg-white text-slate-950 hover:bg-slate-100"
          }`}
          onClick={handleContentCopy}
        >
          {isContentCopied ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-700" />
          ) : (
            <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isContentCopied ? "Скопировано!" : "Копировать подпись"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 border-amber-700 bg-amber-100 px-2 text-xs text-amber-950 hover:bg-amber-200"
          onClick={(e) => {
            e.stopPropagation();
            window.open(explorerUrl, "_blank");
          }}
        >
          <svg
            className="h-3.5 w-3.5 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          Открыть в Explorer
        </Button>
      </div>
    </div>
  );
}
