"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

type DateEntry = { departureDate: string; returnDate: string; soldOut?: boolean };

type Props = {
  dates: DateEntry[];
};

const FullBadge = () => (
  <span className="bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ml-2">
    Full
  </span>
);

export default function DatesDropdown({ dates }: Props) {
  const [open, setOpen] = useState(false);

  if (dates.length === 0) return null;

  if (dates.length === 1) {
    const d = dates[0];
    return (
      <div className="flex items-center gap-2 text-neutral-600 text-sm">
        <Calendar size={16} className="shrink-0" />
        <span className={d.soldOut ? "line-through text-neutral-400" : ""}>
          {new Date(d.departureDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}{" "}
          –{" "}
          {new Date(d.returnDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {d.soldOut && <FullBadge />}
      </div>
    );
  }

  const openCount = dates.filter((d) => !d.soldOut).length;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-neutral-600 text-sm w-full"
      >
        <Calendar size={16} className="shrink-0" />
        <span>
          {openCount} of {dates.length} dates available
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="ml-6 mt-2 flex flex-col gap-1.5">
          {dates.map((d, i) => (
            <p
              key={i}
              className={`text-xs flex items-center ${
                d.soldOut ? "text-neutral-400 line-through" : "text-neutral-500"
              }`}
            >
              {new Date(d.departureDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              –{" "}
              {new Date(d.returnDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {d.soldOut && <FullBadge />}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
