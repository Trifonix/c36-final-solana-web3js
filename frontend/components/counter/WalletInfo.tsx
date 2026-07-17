"use client";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { NETWORK_LABELS, SOLANA_NETWORK } from "@/lib/solana-config";

const MAX_VISIBLE_BOLTS = 16;

const BOLT_POSITIONS = [
  { left: "-13%", top: "8%" },
  { left: "104%", top: "16%" },
  { left: "-17%", top: "34%" },
  { left: "108%", top: "42%" },
  { left: "-14%", top: "64%" },
  { left: "105%", top: "72%" },
  { left: "2%", top: "-8%" },
  { left: "84%", top: "-7%" },
  { left: "5%", top: "96%" },
  { left: "88%", top: "94%" },
  { left: "-9%", top: "84%" },
  { left: "101%", top: "88%" },
  { left: "26%", top: "-10%" },
  { left: "64%", top: "-9%" },
  { left: "28%", top: "98%" },
  { left: "67%", top: "97%" },
] as const;

type LightningStyle = CSSProperties & {
  "--bolt-delay": string;
  "--bolt-duration": string;
  "--bolt-rotation": string;
};

function SegmentedBolt({ activeSegments }: { activeSegments: number }) {
  const clipId = `bolt-${useId().replaceAll(":", "")}`;

  return (
    <svg viewBox="0 0 24 24" role="presentation">
      <defs>
        <clipPath id={clipId}>
          <polygon points="12.7,1 3.8,13.1 10.5,13.1 7.7,23 20.4,9.4 13.5,9.4 17.2,1" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 10 }, (_, index) => {
          const isActive = index >= 10 - activeSegments;

          return (
            <rect
              className={
                isActive
                  ? "bolt-segment bolt-segment--active"
                  : "bolt-segment bolt-segment--empty"
              }
              x="2"
              y={1 + index * 2.2}
              width="20"
              height="1.55"
              key={index}
            />
          );
        })}
      </g>
      <polygon
        className="bolt-outline"
        points="12.7,1 3.8,13.1 10.5,13.1 7.7,23 20.4,9.4 13.5,9.4 17.2,1"
      />
    </svg>
  );
}

function BalanceLightning({ balance }: { balance: number }) {
  const bolts = useMemo(() => {
    const totalTenths = Math.max(0, Math.round(balance * 10));
    const fullBoltCount = Math.floor(totalTenths / 10);
    const partialSegments = totalTenths % 10;
    const visibleFullBolts = Math.min(fullBoltCount, MAX_VISIBLE_BOLTS);

    return [
      ...Array.from({ length: visibleFullBolts }, () => 10),
      ...(partialSegments > 0 && visibleFullBolts < MAX_VISIBLE_BOLTS
        ? [partialSegments]
        : []),
    ];
  }, [balance]);

  return (
    <div className="balance-lightning-layer" aria-hidden="true">
      {bolts.map((activeSegments, index) => {
        const position = BOLT_POSITIONS[index % BOLT_POSITIONS.length];
        const style: LightningStyle = {
          ...position,
          "--bolt-delay": `${(index * -0.37).toFixed(2)}s`,
          "--bolt-duration": `${2.4 + (index % 5) * 0.3}s`,
          "--bolt-rotation": `${index % 2 === 0 ? -12 : 14}deg`,
        };

        return (
          <span
            className="balance-lightning"
            style={style}
            key={`${index}-${activeSegments}`}
          >
            <SegmentedBolt activeSegments={activeSegments} />
          </span>
        );
      })}
    </div>
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
      {connected && balance !== null && <BalanceLightning balance={balance} />}
      <div className="w-full space-y-1 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
          Network: {networkName}
        </p>
        {connected ? (
          <p className="text-base font-bold text-slate-950">
            {isLoading && balance === null
              ? "Loading balance…"
              : `${balance?.toFixed(4) ?? "—"} SOL`}
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-600">
            Connect wallet to see balance
          </p>
        )}
      </div>
    </>
  );
}
