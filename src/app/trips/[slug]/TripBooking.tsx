"use client";

import { useRouter } from "next/navigation";

type Props = {
  tripSlug: string;
  dateCount: number;
  allFull: boolean;
};

export default function TripBooking({ tripSlug, dateCount, allFull }: Props) {
  const router = useRouter();

  if (allFull) {
    return (
      <button
        disabled
        className="w-full bg-neutral-300 text-neutral-600 text-center font-semibold py-3 uppercase tracking-wider text-sm cursor-not-allowed"
      >
        All Dates Full
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(`/trips/${tripSlug}/book`)}
      className="w-full bg-accent hover:bg-accent-dark text-white text-center font-semibold py-3 uppercase tracking-wider text-sm transition-colors"
    >
      Book Now{dateCount > 0 ? ` — ${dateCount} ${dateCount === 1 ? "date" : "dates"} available` : ""}
    </button>
  );
}
