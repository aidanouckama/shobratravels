"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  accept: "image" | "pdf";
  label: string;
};

export default function FileUpload({ value, onChange, accept, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes =
    accept === "image"
      ? "image/jpeg,image/png,image/webp"
      : "application/pdf";

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const Icon = accept === "pdf" ? FileText : ImageIcon;

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
        {label}
      </label>

      {value ? (
        <div className="border-2 border-neutral-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {accept === "image" ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-16 h-16 object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-green-50 flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-accent" />
                </div>
              )}
              <p className="text-xs text-neutral-500 truncate">{value}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 hover:border-accent p-8 text-center cursor-pointer transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-accent" />
              <p className="text-sm text-neutral-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                <Upload size={18} className="text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500">
                Drop a file or <span className="text-accent font-medium">browse</span>
              </p>
              <p className="text-xs text-neutral-400">
                {accept === "image"
                  ? "JPEG, PNG, or WebP — max 10MB"
                  : "PDF — max 10MB"}
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
