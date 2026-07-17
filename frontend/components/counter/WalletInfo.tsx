"use client";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { NETWORK_LABELS, SOLANA_NETWORK } from "@/lib/solana-config";

const MAX_VISIBLE_SNAKES = 16;

type SnakeStyle = CSSProperties & {
  "--snake-delay": string;
  "--snake-duration": string;
  "--snake-rotation": string;
  "--snake-drift-x": string;
  "--snake-drift-y": string;
};

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function SegmentedSnake({ segmentCount }: { segmentCount: number }) {
  const segments = Array.from({ length: segmentCount }, (_, index) => ({
    x: 10 + index * 9,
    y: 20 + Math.sin(index * 1.15) * 6,
    radius: 3.8 + index * 0.22,
  }));
  const head = segments[segments.length - 1];
  const viewBoxWidth = Math.max(56, 20 + segmentCount * 9);

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} 40`} role="presentation">
      {segments.map((segment, index) => (
        <circle
          className={`snake-segment ${
            index === segments.length - 1 ? "snake-segment--head" : ""
          }`}
          cx={segment.x}
          cy={segment.y}
          r={segment.radius}
          style={{ animationDelay: `${index * -0.09}s` }}
          key={index}
        />
      ))}
      <circle
        className="snake-eye"
        cx={head.x + head.radius * 0.45}
        cy={head.y - head.radius * 0.38}
        r="0.9"
      />
      <path
        className="snake-tongue"
        d={`M ${head.x + head.radius * 0.8} ${head.y + 0.5} l 5 0 l 2 -2 m -2 2 l 2 2`}
      />
    </svg>
  );
}

function BalanceSnakes({ balance }: { balance: number }) {
  const snakes = useMemo(() => {
    const totalTenths = Math.max(0, Math.round(balance * 10));
    const fullSnakeCount = Math.floor(totalTenths / 10);
    const partialSegments = totalTenths % 10;
    const visibleFullSnakes = Math.min(
      fullSnakeCount,
      MAX_VISIBLE_SNAKES
    );
    const segmentCounts = [
      ...Array.from({ length: visibleFullSnakes }, () => 10),
      ...(partialSegments > 0 && visibleFullSnakes < MAX_VISIBLE_SNAKES
        ? [partialSegments]
        : []),
    ];

    return segmentCounts.map((segmentCount, index) => {
      const seed = totalTenths * 97 + index * 53;
      const sizeVariation = 58 + seededRandom(seed + 1) * 54;
      const partialScale =
        segmentCount < 10 ? 0.55 + segmentCount * 0.035 : 1;
      const style: SnakeStyle = {
        left: `${3 + seededRandom(seed + 2) * 88}%`,
        top: `${4 + seededRandom(seed + 3) * 84}%`,
        width: `${Math.round(sizeVariation * partialScale)}px`,
        "--snake-delay": `${(-seededRandom(seed + 4) * 10).toFixed(2)}s`,
        "--snake-duration": `${(
          7 +
          seededRandom(seed + 5) * 8
        ).toFixed(2)}s`,
        "--snake-rotation": `${Math.round(
          seededRandom(seed + 6) * 360
        )}deg`,
        "--snake-drift-x": `${Math.round(
          (seededRandom(seed + 7) - 0.5) * 130
        )}px`,
        "--snake-drift-y": `${Math.round(
          (seededRandom(seed + 8) - 0.5) * 100
        )}px`,
      };

      return { segmentCount, style };
    });
  }, [balance]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="balance-snake-layer" aria-hidden="true">
      {snakes.map(({ segmentCount, style }, index) => (
        <span
          className="balance-snake"
          style={style}
          key={`${index}-${segmentCount}`}
        >
          <SegmentedSnake segmentCount={segmentCount} />
        </span>
      ))}
    </div>,
    document.body
  );
}

/**
 * Displays the connected wallet's SOL balance and the active Solana network.
 */
export function WalletInfo() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const networkName = NETWORK_LABELS[SOLANA_NETWORK];

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    try {
      setIsLoading(true);
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Error fetching SOL balance:", err);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (!publicKey) return;

    const subscriptionId = connection.onAccountChange(publicKey, (info) => {
      setBalance(info.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey]);

  return (
    <>
      {connected && balance !== null && <BalanceSnakes balance={balance} />}
      <div className="w-full space-y-1 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
          Сеть: {networkName}
        </p>
        {connected ? (
          <p className="text-base font-bold text-slate-950">
            {isLoading && balance === null
              ? "Загрузка баланса…"
              : `${balance?.toFixed(4) ?? "—"} SOL`}
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-600">
            Подключите кошелёк, чтобы увидеть баланс
          </p>
        )}
      </div>
    </>
  );
}
