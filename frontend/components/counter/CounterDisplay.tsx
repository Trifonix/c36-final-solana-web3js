"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useProgram } from "./hooks/useProgram";

const MAX_COUNTER_SNAKE_SEGMENTS = 10;

function CounterSnake({ value }: { value: number }) {
  if (typeof document === "undefined" || value <= 0) {
    return null;
  }

  // До 1000 единиц одна секция равна 100. Для больших значений шаг
  // увеличивается так, чтобы у змейки оставалось не более десяти секций.
  const segmentUnit = Math.max(100, Math.ceil(value / 1000) * 100);
  const segmentCount = Math.min(
    MAX_COUNTER_SNAKE_SEGMENTS,
    Math.ceil(value / segmentUnit)
  );
  const snakeLengthInSegments = value / segmentUnit;
  const segmentWidth = 76;
  const segmentStep = 68;
  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const threshold = segmentUnit * (index + 1);

    return {
      x: 12 + index * segmentStep,
      y: 34 + Math.sin(index * 0.95) * 14,
      label: Math.min(threshold, value),
    };
  });
  const head = segments[segments.length - 1];
  const viewBoxWidth = 34 + segmentCount * segmentStep;

  return createPortal(
    <div className="counter-snake-layer" aria-hidden="true">
      <div
        className="counter-snake"
        style={{
          width: `${Math.min(
            920,
            90 + snakeLengthInSegments * 80
          )}px`,
          maxWidth: "88vw",
        }}
      >
        <svg viewBox={`0 0 ${viewBoxWidth} 96`} role="presentation">
          {segments.map((segment, index) => (
            <g
              className="counter-snake-segment"
              style={{ animationDelay: `${index * -0.12}s` }}
              key={segment.label}
            >
              <rect
                x={segment.x}
                y={segment.y}
                width={segmentWidth}
                height="34"
                rx="17"
              />
              <text
                x={segment.x + segmentWidth / 2}
                y={segment.y + 22}
                textAnchor="middle"
              >
                {segment.label}
              </text>
            </g>
          ))}
          <circle
            className="counter-snake-eye"
            cx={head.x + segmentWidth - 14}
            cy={head.y + 10}
            r="2.2"
          />
          <path
            className="counter-snake-tongue"
            d={`M ${head.x + segmentWidth - 1} ${head.y + 18} l 11 0 l 4 -4 m -4 4 l 4 4`}
          />
        </svg>
      </div>
    </div>,
    document.body
  );
}

/**
 * CounterDisplay component that displays the current counter value
 * and handles its own data fetching logic.
 */
export function CounterDisplay() {
  // Get program information from the hook
  const { program, counterAddress, connection } = useProgram();

  // Local state
  const [counterValue, setCounterValue] = useState<number | null>(null);
  const [isFetchingCounter, setIsFetchingCounter] = useState(true);

  // Fetch counter account to get the count value
  const fetchCounterValue = useCallback(async () => {
    if (!connection || !program) return;

    try {
      setIsFetchingCounter(true);
      const counterAccount = await program.account.counter.fetch(
        counterAddress
      );
      setCounterValue(Number(counterAccount.count));
    } catch (err) {
      console.error("Error fetching counter value:", err);
      setCounterValue(null);
    } finally {
      setIsFetchingCounter(false);
    }
  }, [connection, counterAddress, program]);

  // Initial fetch and on connection change
  useEffect(() => {
    if (connection) {
      fetchCounterValue();
    }
  }, [connection, fetchCounterValue]);

  // Set up WebSocket subscription to listen for account changes
  useEffect(() => {
    if (!connection) return;

    try {
      // Subscribe to account changes
      const subscriptionId = connection.onAccountChange(
        counterAddress,
        (accountInfo) => {
          const decoded = program.coder.accounts.decode(
            "counter",
            accountInfo.data
          );
          console.log("Decoded counter value:", decoded);
          setCounterValue(Number(decoded.count));
        },
        {
          commitment: "confirmed",
          encoding: "base64",
        }
      );

      // Clean up subscription when component unmounts
      return () => {
        console.log("Unsubscribing from counter account");
        connection.removeAccountChangeListener(subscriptionId);
      };
    } catch (err) {
      console.error("Error setting up account subscription:", err);
      return () => {};
    }
  }, [connection, counterAddress, program]);

  return (
    <>
      {counterValue !== null && <CounterSnake value={counterValue} />}
      <div className="w-full px-2 text-center">
        <p className="mb-2 text-sm font-bold text-slate-600">
          Текущий счётчик:
        </p>
        <div className="flex h-14 items-center justify-center">
          {isFetchingCounter ? (
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-700/25 border-t-rose-700" />
          ) : (
            <p className="text-4xl font-black text-rose-700">
              {counterValue ?? "—"}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
