"use client";

import { useState } from "react";
import TripForm from "../TripForm";
import TripPdfDropzone from "../TripPdfDropzone";

type Prefill = NonNullable<React.ComponentProps<typeof TripForm>["trip"]>;

export default function NewTripPage() {
  const [prefill, setPrefill] = useState<Prefill | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  const applyPrefill = (p: Prefill) => {
    setPrefill(p);
    setFormKey((k) => k + 1);
  };

  const clearPrefill = () => {
    setPrefill(undefined);
    setFormKey((k) => k + 1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Create New Trip
      </h1>

      <TripPdfDropzone onPrefill={applyPrefill} onClear={clearPrefill} />

      <TripForm key={formKey} trip={prefill} />
    </div>
  );
}
