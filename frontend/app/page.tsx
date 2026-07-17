import { CounterCard } from "@/components/counter/CounterCard";

export default function Home() {
  return (
    <main className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#061412] p-4 text-stone-100 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(245,158,11,0.13),transparent_32%),linear-gradient(145deg,#061412_0%,#0b1d1a_50%,#11120e_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.035)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      <div className="absolute left-[12%] top-[18%] h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[16%] right-[10%] h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative z-10 mb-6 text-center">
        <div className="mx-auto mb-3 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
          On-chain energy
        </div>
        <h1 className="mb-2 bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-4xl font-black tracking-tight text-transparent">
          Solana Counter App
        </h1>
        <p className="text-stone-400">
          A minimal dApp built with Anchor & Next.js
        </p>
      </div>

      <div className="relative z-10">
        <CounterCard />
      </div>

      <footer className="absolute bottom-3 z-10 text-center text-xs text-stone-600 sm:text-sm">
        <p>Powered by Anchor, Web3.js, and Shadcn UI</p>
        <p className="mt-1 hidden sm:block">
          Created as a minimal Solana dApp example
        </p>
      </footer>
    </main>
  );
}
