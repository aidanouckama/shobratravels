// Minimal GA4 helper. Safe to call in any component — if gtag isn't
// loaded (dev, ad-blocker, missing measurement ID), it's a no-op.

type GtagArgs = [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    gtag?: (...args: GtagArgs) => void;
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}
