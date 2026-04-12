"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  MapPin,
  BookOpen,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  AlertTriangle,
  Calendar,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import SquarePayment from "@/components/SquarePayment";

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Trips", icon: MapPin },
  { label: "Passport", icon: BookOpen },
  { label: "Payment", icon: CreditCard },
];

type TripDate = {
  id: string;
  departureDate: string;
  returnDate: string;
};

type Trip = {
  id: string;
  slug: string;
  title: string;
  pricePerPerson: number;
  duration: string;
  dates: TripDate[];
};

type SelectedTrip = {
  tripId: string;
  tripDateId: string;
};

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [selectedTrips, setSelectedTrips] = useState<SelectedTrip[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    homePhone: "",
    cellPhone: "",
    address: "",
    passportNumber: "",
    passportCountry: "",
    passportIssued: "",
    passportExpiry: "",
    passportIssuedBy: "",
    passportImage: "",
    paymentMethod: "ach",
  });
  const [uploadingPassport, setUploadingPassport] = useState(false);

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((data: Trip[]) => {
        setTrips(data);
        const tripSlug = searchParams.get("trip");
        if (tripSlug) {
          const match = data.find((t) => t.slug === tripSlug);
          if (match && match.dates.length > 0) {
            setSelectedTrips([
              { tripId: match.id, tripDateId: match.dates[0].id },
            ]);
          }
        }
      });
  }, [searchParams]);

  const handleFullSubmit = async (sourceId: string) => {
    setSubmitting(true);
    setError("");
    try {
      // Submit one registration per selected trip
      for (const sel of selectedTrips) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            tripId: sel.tripId,
            tripDateId: sel.tripDateId,
            sourceId,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Registration failed");
        }
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Check for date collisions between selected trips
  const dateCollision = useMemo(() => {
    if (selectedTrips.length < 2) return null;

    for (let i = 0; i < selectedTrips.length; i++) {
      for (let j = i + 1; j < selectedTrips.length; j++) {
        const tripA = trips.find((t) => t.id === selectedTrips[i].tripId);
        const tripB = trips.find((t) => t.id === selectedTrips[j].tripId);
        const dateA = tripA?.dates.find(
          (d) => d.id === selectedTrips[i].tripDateId
        );
        const dateB = tripB?.dates.find(
          (d) => d.id === selectedTrips[j].tripDateId
        );
        if (!dateA || !dateB) continue;

        const aStart = new Date(dateA.departureDate).getTime();
        const aEnd = new Date(dateA.returnDate).getTime();
        const bStart = new Date(dateB.departureDate).getTime();
        const bEnd = new Date(dateB.returnDate).getTime();

        if (aStart <= bEnd && bStart <= aEnd) {
          return `"${tripA?.title}" and "${tripB?.title}" have overlapping dates. Please choose different dates.`;
        }
      }
    }
    return null;
  }, [selectedTrips, trips]);

  const canAdvance = () => {
    if (step === 0)
      return form.fullName && form.email && form.cellPhone && form.address;
    if (step === 1) return selectedTrips.length > 0 && !dateCollision;
    if (step === 2)
      return (
        form.passportNumber &&
        form.passportCountry &&
        form.passportIssued &&
        form.passportExpiry &&
        form.passportIssuedBy &&
        form.passportImage
      );
    return true;
  };

  // Calculate total based on all selected trips
  const totalDeposit = selectedTrips.length * 1200;
  const isCC = form.paymentMethod === "credit_card";
  const ccFee = Math.round(totalDeposit * 0.039 * 100) / 100;
  const totalAmount = isCC ? totalDeposit + ccFee : totalDeposit;
  const totalCents = Math.round(totalAmount * 100);
  const displayTotal = `$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const displayFee = isCC ? "3.9% processing fee" : "No processing fee";

  const tripPrice = useMemo(() => {
    return selectedTrips.reduce((sum, sel) => {
      const trip = trips.find((t) => t.id === sel.tripId);
      return sum + (trip?.pricePerPerson || 0);
    }, 0);
  }, [selectedTrips, trips]);

  const toggleTrip = (tripId: string) => {
    setSelectedTrips((prev) => {
      const existing = prev.find((s) => s.tripId === tripId);
      if (existing) {
        return prev.filter((s) => s.tripId !== tripId);
      }
      const trip = trips.find((t) => t.id === tripId);
      if (!trip || trip.dates.length === 0) return prev;
      return [...prev, { tripId, tripDateId: trip.dates[0].id }];
    });
  };

  const setTripDate = (tripId: string, tripDateId: string) => {
    setSelectedTrips((prev) =>
      prev.map((s) => (s.tripId === tripId ? { ...s, tripDateId } : s))
    );
  };

  if (submitted) {
    return (
      <section className="py-24 md:py-36">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-accent/10 mx-auto mb-8 flex items-center justify-center">
            <div className="w-14 h-14 bg-accent flex items-center justify-center">
              <Check size={28} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4">
            Payment Complete
          </h1>
          <p className="text-neutral-500 text-lg mb-6">
            Your deposit has been received and your spot is confirmed.
          </p>
          <div className="bg-green-50 border border-green-200 p-6 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Traveler</span>
              <span className="font-semibold">{form.fullName}</span>
            </div>
            {selectedTrips.map((sel) => {
              const trip = trips.find((t) => t.id === sel.tripId);
              return (
                <div key={sel.tripId} className="flex justify-between">
                  <span className="text-neutral-500">Trip</span>
                  <span className="font-semibold">{trip?.title}</span>
                </div>
              );
            })}
            <div className="flex justify-between">
              <span className="text-neutral-500">Deposit Paid</span>
              <span className="font-semibold">{displayTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Confirmation sent to</span>
              <span className="font-semibold">{form.email}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-14">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 transition-colors ${
                  i < step ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all ${
                    i < step
                      ? "bg-accent text-white"
                      : i === step
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {i < step ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <s.icon size={16} />
                  )}
                </div>
                <span
                  className={`text-xs uppercase tracking-widest hidden sm:block ${
                    i <= step
                      ? "text-neutral-900 font-semibold"
                      : "text-neutral-400"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-4 transition-colors ${
                    i < step ? "bg-accent" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[340px]">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                Your Details
              </h2>
              <p className="text-neutral-500 text-sm mb-8">
                Tell us who&apos;s traveling.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors text-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@email.com"
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Cell Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.cellPhone}
                    onChange={(e) => update("cellPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Home Phone{" "}
                    <span className="text-neutral-400 normal-case tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.homePhone}
                    onChange={(e) => update("homePhone", e.target.value)}
                    placeholder="(555) 987-6543"
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Mailing Address
                  </label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="123 Main St, City, State ZIP"
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                Choose Your Tours
              </h2>
              <p className="text-neutral-500 text-sm mb-8">
                Select one or more trips and pick your preferred dates. Deposit
                is <strong>$1,200 per trip</strong>.
              </p>
              <div className="flex flex-col gap-4">
                {trips.map((trip) => {
                  const isSelected = selectedTrips.some(
                    (s) => s.tripId === trip.id
                  );
                  const selectedDate = selectedTrips.find(
                    (s) => s.tripId === trip.id
                  )?.tripDateId;

                  return (
                    <div
                      key={trip.id}
                      className={`border-2 transition-all ${
                        isSelected
                          ? "border-accent bg-green-50"
                          : "border-neutral-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTrip(trip.id)}
                        className="w-full text-left p-5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold uppercase tracking-wider text-sm">
                              {trip.title}
                            </p>
                            <p className="text-neutral-500 text-xs mt-1">
                              {trip.duration} &middot; $1,200 deposit
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-lg">
                              ${trip.pricePerPerson.toLocaleString()}
                            </span>
                            <div
                              className={`w-5 h-5 border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-accent bg-accent"
                                  : "border-neutral-300"
                              }`}
                            >
                              {isSelected && (
                                <Check
                                  size={12}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {isSelected && trip.dates.length > 0 && (
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                            Select Dates
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {trip.dates.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => setTripDate(trip.id, d.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm border transition-all ${
                                  selectedDate === d.id
                                    ? "border-accent bg-accent text-white"
                                    : "border-neutral-300 hover:border-neutral-400"
                                }`}
                              >
                                <Calendar size={13} />
                                {new Date(d.departureDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" }
                                )}{" "}
                                –{" "}
                                {new Date(d.returnDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {trips.length === 0 && (
                  <p className="text-neutral-400 py-8 text-center">
                    Loading available tours...
                  </p>
                )}
              </div>

              {/* Date collision warning */}
              {dateCollision && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 text-sm flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p>{dateCollision}</p>
                </div>
              )}

              {/* Selected summary */}
              {selectedTrips.length > 0 && !dateCollision && (
                <div className="mt-6 bg-green-50 border border-green-200 p-4 text-sm">
                  <div className="flex justify-between font-bold">
                    <span>
                      {selectedTrips.length}{" "}
                      {selectedTrips.length === 1 ? "trip" : "trips"} selected
                    </span>
                    <span>
                      ${tripPrice.toLocaleString()} total
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                Passport Information
              </h2>
              <p className="text-neutral-500 text-sm mb-8">
                Required for international travel arrangements.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    required
                    value={form.passportNumber}
                    onChange={(e) => update("passportNumber", e.target.value)}
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={form.passportCountry}
                    onChange={(e) => update("passportCountry", e.target.value)}
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Date Issued
                  </label>
                  <input
                    type="date"
                    required
                    value={form.passportIssued}
                    onChange={(e) => update("passportIssued", e.target.value)}
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.passportExpiry}
                    onChange={(e) => update("passportExpiry", e.target.value)}
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                    Issued By
                  </label>
                  <input
                    type="text"
                    required
                    value={form.passportIssuedBy}
                    onChange={(e) => update("passportIssuedBy", e.target.value)}
                    placeholder="e.g. US Department of State"
                    className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Passport Photo Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                    Passport Photo
                  </label>
                  {form.passportImage ? (
                    <div className="border-2 border-neutral-200 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={form.passportImage}
                          alt="Passport"
                          className="w-16 h-16 object-cover"
                        />
                        <p className="text-xs text-accent font-medium">
                          Uploaded
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => update("passportImage", "")}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-neutral-300 hover:border-accent p-6 text-center cursor-pointer transition-colors block">
                      {uploadingPassport ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2
                            size={24}
                            className="animate-spin text-accent"
                          />
                          <p className="text-sm text-neutral-500">
                            Uploading...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload
                            size={20}
                            className="text-neutral-400"
                          />
                          <p className="text-sm text-neutral-500">
                            Upload a photo of your passport
                          </p>
                          <p className="text-xs text-neutral-400">
                            JPEG, PNG, or WebP
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingPassport(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            if (res.ok) {
                              const { url } = await res.json();
                              update("passportImage", url);
                            }
                          } finally {
                            setUploadingPassport(false);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                Payment Method
              </h2>
              <p className="text-neutral-500 text-sm mb-8">
                Deposit of <strong>${totalDeposit.toLocaleString()}.00</strong>{" "}
                for {selectedTrips.length}{" "}
                {selectedTrips.length === 1 ? "trip" : "trips"}.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => update("paymentMethod", "ach")}
                  className={`w-full text-left p-5 border-2 transition-all relative ${
                    form.paymentMethod === "ach"
                      ? "border-accent bg-green-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span className="absolute -top-3 right-4 bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    Recommended
                  </span>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                        form.paymentMethod === "ach"
                          ? "bg-accent text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase tracking-wider">
                        Bank Transfer
                      </p>
                      <p className="text-neutral-500 text-xs mt-0.5">
                        Secure ACH direct debit
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">
                        ${totalDeposit.toLocaleString()}.00
                      </p>
                      <p className="text-accent text-xs font-semibold">
                        No fee
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => update("paymentMethod", "credit_card")}
                  className={`w-full text-left p-5 border-2 transition-all ${
                    form.paymentMethod === "credit_card"
                      ? "border-accent bg-green-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                        form.paymentMethod === "credit_card"
                          ? "bg-accent text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      <CreditCard size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase tracking-wider">
                        Credit Card
                      </p>
                      <p className="text-neutral-500 text-xs mt-0.5">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{displayTotal}</p>
                      <p className="text-neutral-400 text-xs">3.9% fee</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Order summary */}
              <div className="bg-green-50 border border-green-200 p-5 mt-8 text-sm">
                {selectedTrips.map((sel) => {
                  const trip = trips.find((t) => t.id === sel.tripId);
                  const date = trip?.dates.find(
                    (d) => d.id === sel.tripDateId
                  );
                  return (
                    <div key={sel.tripId} className="mb-3">
                      <div className="flex justify-between">
                        <span className="font-medium truncate mr-4">
                          {trip?.title}
                        </span>
                        <span className="shrink-0">
                          ${trip?.pricePerPerson.toLocaleString()}
                        </span>
                      </div>
                      {date && (
                        <p className="text-neutral-400 text-xs mt-0.5">
                          {new Date(date.departureDate).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric" }
                          )}{" "}
                          –{" "}
                          {new Date(date.returnDate).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-between pt-3 border-t border-green-200 mb-2">
                  <span className="text-neutral-500">
                    Deposit ({selectedTrips.length}{" "}
                    {selectedTrips.length === 1 ? "trip" : "trips"} &times;
                    $1,200)
                  </span>
                  <span>${totalDeposit.toLocaleString()}.00</span>
                </div>
                {isCC && (
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-500">
                      Processing fee (3.9%)
                    </span>
                    <span>${ccFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-green-200 font-bold">
                  <span>Total due today</span>
                  <span>{displayTotal}</span>
                </div>
              </div>

              {/* Authorization */}
              <label className="flex items-start gap-3 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  className="mt-1 shrink-0"
                />
                <span className="text-xs text-neutral-500 leading-relaxed">
                  I authorize Shobra Travel Agency, LLC to charge the selected
                  payment method for the deposit amount shown above. I
                  understand my registration will not be complete until the
                  deposit payment is received.{" "}
                  <span className="text-neutral-400">ARC-31-76913-5</span>
                </span>
              </label>

              {/* Embedded Square Payment */}
              {authorized && (
                <SquarePayment
                  method={form.paymentMethod as "credit_card" | "ach"}
                  transactionId={selectedTrips[0]?.tripDateId || ""}
                  holderName={form.fullName}
                  totalCents={totalCents}
                  total={displayTotal}
                  fee={displayFee}
                  processing={submitting}
                  onTokenized={handleFullSubmit}
                  onError={(msg) => setError(msg)}
                />
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Navigation — only show on steps 0-2 */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className={`flex items-center gap-2 text-sm uppercase tracking-wider font-semibold transition-colors ${
                step === 0
                  ? "invisible"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-8 py-3 uppercase tracking-wider text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setStep(2);
                setAuthorized(false);
              }}
              className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
