"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Lock } from "lucide-react";

declare global {
  interface Window {
    Square: {
      payments: (
        appId: string,
        locationId: string
      ) => Promise<SquarePayments>;
    };
  }
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
  ach: (options: {
    redirectURI: string;
    transactionId: string;
  }) => Promise<SquareACH>;
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<TokenResult>;
  destroy: () => void;
}

interface SquareACH {
  tokenize: (options: {
    accountHolderName: string;
    intent: string;
    amount: string;
    currency: string;
  }) => Promise<TokenResult>;
  destroy: () => void;
}

interface TokenResult {
  status: string;
  token: string;
  errors?: { message: string }[];
}

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
  const cardRef = useRef<SquareCard | null>(null);
  const achRef = useRef<SquareACH | null>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const initializedRef = useRef(false);

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
      let tokenResult: TokenResult | undefined;

      if (method === "credit_card" && cardRef.current) {
        tokenResult = await cardRef.current.tokenize();
      } else if (method === "ach" && achRef.current) {
        const amountDollars = (totalCents / 100).toFixed(2);
        tokenResult = await achRef.current.tokenize({
          accountHolderName: holderName,
          intent: "CHARGE",
          amount: amountDollars,
          currency: "USD",
        });
      }

      if (!tokenResult || tokenResult.status !== "OK") {
        const errorMsg =
          tokenResult?.errors?.[0]?.message || "Payment verification failed";
        onError(errorMsg);
        setProcessing(false);
        return;
      }

      onTokenized(tokenResult.token);
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
