"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteTripButton({ tripId }: { tripId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;

    const res = await fetch(`/api/admin/trips/${tripId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete trip.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1 text-red-600 hover:underline"
    >
      <Trash2 size={14} /> Delete
    </button>
  );
}
