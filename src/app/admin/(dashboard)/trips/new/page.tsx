"use client";

import { useRef, useState } from "react";
import { Loader2, FileText, X, Sparkles } from "lucide-react";
import TripForm from "../TripForm";

type Extracted = {
  title: string;
  slug: string;
  description: string;
  destinations: string;
  duration: string;
  dates: { departureDate: string; returnDate: string }[];
  groupSizeMin?: number;
  groupSizeMax?: number;
  pricePerPerson: number;
  singleSupplement?: number;
  inclusions: string;
  exclusions: string;
};

type Prefill = React.ComponentProps<typeof TripForm>["trip"];

export default function NewTripPage() {
  const [status, setStatus] = useState<"idle" | "parsing" | "error">("idle");
  const [error, setError] = useState("");
  const [parsedFile, setParsedFile] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<Prefill | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File) => {
    setStatus("parsing");
    setError("");
    try {
      const parseFd = new FormData();
      parseFd.append("file", f);
      const uploadFd = new FormData();
      uploadFd.append("file", f);
      const [parseRes, uploadRes] = await Promise.all([
        fetch("/api/admin/trips/parse-pdf", { method: "POST", body: parseFd }),
        fetch("/api/admin/upload", { method: "POST", body: uploadFd }),
      ]);
      if (!parseRes.ok) {
        const d = await parseRes.json().catch(() => ({}));
        throw new Error(d.error || "Parse failed");
      }
      const data = (await parseRes.json()) as Extracted;
      const pdfUrl = uploadRes.ok ? (await uploadRes.json()).url : "";

      setPrefill({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        destinations: data.destinations || "",
        duration: data.duration || "",
        dates:
          data.dates && data.dates.length > 0
            ? data.dates
            : [{ departureDate: "", returnDate: "" }],
        groupSizeMin: data.groupSizeMin || 0,
        groupSizeMax: data.groupSizeMax || 0,
        pricePerPerson: data.pricePerPerson || 0,
        singleSupplement: data.singleSupplement || 0,
        inclusions: data.inclusions || "",
        exclusions: data.exclusions || "",
        heroImage: "",
        pdfUrl,
        published: false,
        featured: false,
      });
      setParsedFile(f.name);
      setFormKey((k) => k + 1);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse failed");
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clearPrefill = () => {
    setPrefill(undefined);
    setParsedFile(null);
    setError("");
    setFormKey((k) => k + 1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Create New Trip
      </h1>

      <div className="max-w-3xl mb-8">
        {status === "parsing" ? (
          <div className="border-2 border-neutral-200 p-6 flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-accent" />
            <p className="text-sm font-medium">Extracting trip details from PDF…</p>
          </div>
        ) : parsedFile ? (
          <div className="border border-neutral-200 bg-green-50 px-4 py-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              Pre-filled from <span className="font-medium">{parsedFile}</span>. Review and edit below.
            </span>
            <button
              onClick={clearPrefill}
              className="text-neutral-500 hover:text-neutral-700 uppercase tracking-wider text-xs"
            >
              Start blank
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) onFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 hover:border-accent p-6 flex items-center gap-3 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 bg-green-50 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Optional — drop a trip PDF or <span className="text-accent">browse</span> to auto-fill the form
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Itinerary brochures up to 10MB. You can also fill it in manually below.
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          </div>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <TripForm key={formKey} trip={prefill} />
    </div>
  );
}
