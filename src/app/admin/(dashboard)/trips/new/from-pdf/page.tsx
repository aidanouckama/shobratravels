"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, FileText, X, Sparkles } from "lucide-react";
import TripForm from "../../TripForm";

type Extracted = {
  title: string;
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

export default function NewTripFromPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File) => {
    setFile(f);
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
      setExtracted(data);
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        setPdfUrl(url);
      }
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setExtracted(null);
    setPdfUrl("");
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  if (status === "ready" && extracted) {
    const initial = {
      title: extracted.title || "",
      slug: "",
      description: extracted.description || "",
      destinations: extracted.destinations || "",
      duration: extracted.duration || "",
      dates:
        extracted.dates && extracted.dates.length > 0
          ? extracted.dates
          : [{ departureDate: "", returnDate: "" }],
      groupSizeMin: extracted.groupSizeMin || 0,
      groupSizeMax: extracted.groupSizeMax || 0,
      pricePerPerson: extracted.pricePerPerson || 0,
      singleSupplement: extracted.singleSupplement || 0,
      inclusions: extracted.inclusions || "",
      exclusions: extracted.exclusions || "",
      heroImage: "",
      pdfUrl: pdfUrl,
      published: false,
      featured: false,
    };
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              Review Extracted Trip
            </h1>
            <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              Pre-filled from <span className="font-medium">{file?.name}</span>. Review and edit before saving.
            </p>
          </div>
          <button
            onClick={reset}
            className="text-sm text-neutral-500 hover:text-neutral-700 uppercase tracking-wider"
          >
            Upload different PDF
          </button>
        </div>
        <TripForm trip={initial} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
        Create Trip From PDF
      </h1>
      <p className="text-neutral-500 text-sm mb-8">
        Upload an itinerary brochure and we&apos;ll pre-fill the trip form with extracted details.
      </p>

      <div className="max-w-2xl">
        {status === "parsing" && file ? (
          <div className="border-2 border-neutral-200 p-10 flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="text-sm font-medium">Extracting trip details…</p>
            <p className="text-xs text-neutral-500">{file.name}</p>
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
            className="border-2 border-dashed border-neutral-300 hover:border-accent p-12 text-center cursor-pointer transition-colors"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-50 flex items-center justify-center">
                <FileText size={26} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drop a trip PDF or <span className="text-accent">browse</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Itinerary brochures up to 10MB
                </p>
              </div>
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
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start justify-between gap-3">
            <span>{error}</span>
            <button onClick={reset}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
