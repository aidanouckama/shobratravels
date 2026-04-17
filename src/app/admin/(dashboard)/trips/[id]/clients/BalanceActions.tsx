"use client";

import { useState } from "react";
import { Copy, Check, Mail, Link2 } from "lucide-react";

type Props = {
  registrationId: string;
  initialLinkUrl: string | null;
  status: string;
};

export default function BalanceActions({
  registrationId,
  initialLinkUrl,
  status,
}: Props) {
  const [linkUrl, setLinkUrl] = useState<string | null>(initialLinkUrl);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<null | "link" | "email">(null);
  const [message, setMessage] = useState<string>("");

  if (status === "FULLY_PAID") {
    return <span className="text-xs text-green-700 font-semibold uppercase tracking-wider">Paid</span>;
  }
  if (status === "CANCELLED") {
    return <span className="text-xs text-neutral-400 uppercase tracking-wider">—</span>;
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Copy failed — select the URL manually.");
    }
  };

  const fetchLink = async () => {
    setBusy("link");
    setMessage("");
    try {
      const res = await fetch(
        `/api/admin/registrations/${registrationId}/balance-link`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to fetch link.");
        return;
      }
      setLinkUrl(data.url);
      await copy(data.url);
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(null);
    }
  };

  const sendEmail = async () => {
    if (!confirm("Send a balance-due reminder email to this client?")) return;
    setBusy("email");
    setMessage("");
    try {
      const res = await fetch(
        `/api/admin/registrations/${registrationId}/send-balance-reminder`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to send.");
        return;
      }
      setMessage("Email sent.");
      setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={linkUrl ? () => copy(linkUrl) : fetchLink}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-accent text-white hover:bg-accent-dark disabled:opacity-50 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : linkUrl ? (
            <>
              <Copy size={12} /> Copy Link
            </>
          ) : (
            <>
              <Link2 size={12} /> {busy === "link" ? "Generating…" : "Generate"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={sendEmail}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider border border-neutral-300 hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
        >
          <Mail size={12} /> {busy === "email" ? "Sending…" : "Email"}
        </button>
      </div>
      {message && (
        <div className="text-xs text-neutral-500">{message}</div>
      )}
    </div>
  );
}
