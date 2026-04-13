"use client";

import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";

export default function ArchiveTripButton({
  tripId,
  archived,
}: {
  tripId: string;
  archived: boolean;
}) {
  const router = useRouter();

  async function handleToggle() {
    const res = await fetch(`/api/admin/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1 ${
        archived
          ? "text-accent hover:underline"
          : "text-neutral-400 hover:text-neutral-600 hover:underline"
      }`}
    >
      {archived ? (
        <>
          <ArchiveRestore size={14} /> Restore
        </>
      ) : (
        <>
          <Archive size={14} /> Archive
        </>
      )}
    </button>
  );
}
