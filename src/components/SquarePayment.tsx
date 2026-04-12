"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Lock } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Square: {
      payments: (
        appId: string,
        locationId: string
      ) => Promise<any>;
    };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

type Props = {
  method: "credit_card" | "ach";
  transactionId: string;
  holderName: string;
  totalCents: number;
  total: string;
  fee: string;
  processing?: boolean;
  onTokenized: (sourceId: string) => void;
  onError: (msg: string) => void;
};

export default function SquarePayment({
  method,
  transactionId,
  holderName,
  totalCents,
  total,
  fee,
  processing: externalProcessing,
  onTokenized,
  onError,
}: Props) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const achRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const initializedRef = useRef(false);
  const onTokenizedRef = useRef(onTokenized);
  const onErrorRef = useRef(onError);

  // Keep refs in sync so the event listener always calls the latest callback
  useEffect(() => {
    onTokenizedRef.current = onTokenized;
    onErrorRef.current = onError;
  }, [onTokenized, onError]);

  // Reset internal processing when parent stops processing (e.g. server error)
  useEffect(() => {
    if (!externalProcessing) setProcessing(false);
  }, [externalProcessing]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const script = document.createElement("script");
    script.src =
      process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";
    script.onload = async () => {
      try {
        const payments = await window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );

        if (method === "credit_card") {
          const card = await payments.card();
          await card.attach("#square-card-container");
          cardRef.current = card;
        } else {
          const ach = await payments.ach({
            redirectURI: window.location.href,
            transactionId,
          });

          // ACH uses an event-based flow (Plaid OAuth)
          // Register the listener BEFORE calling tokenize
          ach.addEventListener("ontokenization", (event: { detail: { tokenResult: { status: string; token: string; errors?: { message: string }[] } } }) => {
            const tokenResult = event.detail.tokenResult;
            if (tokenResult.status === "OK") {
              onTokenizedRef.current(tokenResult.token);
            } else {
              const msg = tokenResult.errors?.[0]?.message || "Bank authorization failed";
              onErrorRef.current(msg);
            }
          });

          achRef.current = ach;
        }
        setReady(true);
      } catch (err) {
        console.error("Square init error:", err);
        onError("Failed to load payment form. Please refresh and try again.");
      }
    };
    document.head.appendChild(script);

    return () => {
      cardRef.current?.destroy();
      achRef.current?.destroy();
    };
  }, [method, transactionId, onError]);

  const handlePay = useCallback(async () => {
    setProcessing(true);
    try {
      if (method === "credit_card" && cardRef.current) {
        const tokenResult = await cardRef.current.tokenize();
        if (tokenResult.status !== "OK") {
          const msg = tokenResult.errors?.[0]?.message || "Card verification failed";
          onError(msg);
          setProcessing(false);
          return;
        }
        onTokenized(tokenResult.token);
      } else if (method === "ach" && achRef.current) {
        const amountDollars = (totalCents / 100).toFixed(2);
        // This opens the Plaid modal — result comes back via ontokenization event
        await achRef.current.tokenize({
          accountHolderName: holderName,
          intent: "CHARGE",
          amount: amountDollars,
          currency: "USD",
        });
        // Don't setProcessing(false) here — the event listener handles it
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed");
      setProcessing(false);
    }
  }, [method, holderName, totalCents, onTokenized, onError]);

  return (
    <div className="mt-6">
      {method === "credit_card" && (
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
            Card Details
          </label>
          <div
            id="square-card-container"
            ref={cardContainerRef}
            className="min-h-[44px] border-2 border-neutral-200 p-1"
          />
        </div>
      )}

      {method === "ach" && ready && (
        <div className="mb-6 bg-green-50 border border-green-200 p-5 text-sm text-neutral-600">
          <p>
            Clicking &ldquo;Pay&rdquo; will open a secure bank authorization
            prompt from Square. You&apos;ll select your bank and authorize a
            one-time debit of <strong>{total}</strong>.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!ready || processing || externalProcessing}
        className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-4 uppercase tracking-wider text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing || externalProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : !ready ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Lock size={14} />
            Pay {total}
          </>
        )}
      </button>

      <p className="text-center text-neutral-400 text-xs mt-3 flex items-center justify-center gap-1">
        <Lock size={10} />
        Secured by Square &middot; {fee}
      </p>
    </div>
  );
}
