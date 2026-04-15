"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

type TripDateEntry = {
  departureDate: string;
  returnDate: string;
};

type TripData = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  destinations: string;
  duration: string;
  dates: TripDateEntry[];
  groupSizeMin: number;
  groupSizeMax: number;
  pricePerPerson: number;
  singleSupplement: number;
  inclusions: string;
  exclusions: string;
  heroImage: string;
  pdfUrl: string;
  published: boolean;
  featured: boolean;
};

const emptyTrip: TripData = {
  title: "",
  slug: "",
  description: "",
  destinations: "",
  duration: "",
  dates: [{ departureDate: "", returnDate: "" }],
  groupSizeMin: 0,
  groupSizeMax: 0,
  pricePerPerson: 0,
  singleSupplement: 0,
  inclusions: "",
  exclusions: "",
  heroImage: "",
  pdfUrl: "",
  published: false,
  featured: false,
};

export default function TripForm({ trip }: { trip?: TripData }) {
  const router = useRouter();
  const [form, setForm] = useState<TripData>(() => {
    if (trip) return trip;
    return emptyTrip;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!trip?.id;

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const update = (field: keyof TripData, value: string | number | boolean) =>
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === "title" && !isEdit ? { slug: generateSlug(value as string) } : {}),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit ? `/api/admin/trips/${trip.id}` : "/api/admin/trips";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save trip");
      }

      router.push("/admin/trips");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          required
          rows={6}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Destinations *
          </label>
          <input
            type="text"
            required
            placeholder="Istanbul, Bursa, Cappadocia"
            value={form.destinations}
            onChange={(e) => update("destinations", e.target.value)}
            className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Duration *
          </label>
          <input
            type="text"
            required
            placeholder="13 days"
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Trip Dates */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Trip Dates *</label>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                dates: [...f.dates, { departureDate: "", returnDate: "" }],
              }))
            }
            className="text-sm text-accent hover:underline"
          >
            + Add Date
          </button>
        </div>
        {form.dates.map((d, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 mb-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Departure</label>
              <input
                type="date"
                required
                value={d.departureDate}
                onChange={(e) => {
                  const updated = [...form.dates];
                  updated[i] = { ...updated[i], departureDate: e.target.value };
                  setForm((f) => ({ ...f, dates: updated }));
                }}
                className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Return</label>
              <input
                type="date"
                required
                value={d.returnDate}
                onChange={(e) => {
                  const updated = [...form.dates];
                  updated[i] = { ...updated[i], returnDate: e.target.value };
                  setForm((f) => ({ ...f, dates: updated }));
                }}
                className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
              />
            </div>
            {form.dates.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    dates: f.dates.filter((_, j) => j !== i),
                  }))
                }
                className="self-end mb-1 text-red-500 hover:text-red-700 text-sm px-2 py-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Group Size</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={form.groupSizeMin || ""}
              onChange={(e) => update("groupSizeMin", parseInt(e.target.value) || 0)}
              className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={form.groupSizeMax || ""}
              onChange={(e) => update("groupSizeMax", parseInt(e.target.value) || 0)}
              className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Price Per Person *
          </label>
          <input
            type="number"
            required
            min={0}
            step={0.01}
            value={form.pricePerPerson}
            onChange={(e) => update("pricePerPerson", parseFloat(e.target.value))}
            className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Single Supplement
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.singleSupplement}
            onChange={(e) =>
              update("singleSupplement", parseFloat(e.target.value) || 0)
            }
            className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Inclusions</label>
        <textarea
          rows={3}
          value={form.inclusions}
          onChange={(e) => update("inclusions", e.target.value)}
          className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Exclusions</label>
        <textarea
          rows={3}
          value={form.exclusions}
          onChange={(e) => update("exclusions", e.target.value)}
          className="w-full border border-neutral-300 px-4 py-2.5 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileUpload
          label="Hero Image"
          accept="image"
          value={form.heroImage}
          onChange={(url) => update("heroImage", url)}
        />
        <FileUpload
          label="Itinerary PDF"
          accept="pdf"
          value={form.pdfUrl}
          onChange={(url) => update("pdfUrl", url)}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          <span className="text-sm font-medium">Published</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          <span className="text-sm font-medium">Featured on Homepage</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Trip" : "Create Trip"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/trips")}
          className="border border-neutral-300 px-8 py-3 uppercase tracking-wider text-sm hover:bg-neutral-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
