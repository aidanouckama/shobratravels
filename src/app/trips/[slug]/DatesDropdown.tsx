"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

type Props = {
  dates: { departureDate: string; returnDate: string }[];
};

export default function DatesDropdown({ dates }: Props) {
  const [open, setOpen] = useState(false);

  if (dates.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-neutral-600 text-sm w-full"
      >
        <Calendar size={16} className="shrink-0" />
        <span>
          {dates.length} {dates.length === 1 ? "date" : "dates"} available
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="ml-6 mt-2 flex flex-col gap-1.5">
          {dates.map((d, i) => (
            <p key={i} className="text-xs text-neutral-500">
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
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
