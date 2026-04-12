"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import SquarePayment from "@/components/SquarePayment";

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Trip", icon: MapPin },
  { label: "Passport", icon: BookOpen },
  { label: "Payment", icon: CreditCard },
];

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [trips, setTrips] = useState<
    { id: string; slug: string; title: string; departureDate: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [authorized, setAuthorized] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    homePhone: "",
    cellPhone: "",
    address: "",
    tripId: "",
    passportNumber: "",
    passportCountry: "",
    passportIssued: "",
    passportExpiry: "",
    passportIssuedBy: "",
    paymentMethod: "ach",
  });

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((data) => {
        setTrips(data);
        const tripSlug = searchParams.get("trip");
        if (tripSlug) {
          const match = data.find(
            (t: { slug: string }) => t.slug === tripSlug
          );
          if (match) setForm((f) => ({ ...f, tripId: match.id }));
        }
      });
  }, [searchParams]);

  // Called by SquarePayment after tokenizing — submits everything at once
  const handleFullSubmit = async (sourceId: string) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sourceId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
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

  const canAdvance = () => {
    if (step === 0)
      return form.fullName && form.email && form.cellPhone && form.address;
    if (step === 1) return form.tripId;
    if (step === 2)
      return (
        form.passportNumber &&
        form.passportCountry &&
        form.passportIssued &&
        form.passportExpiry &&
        form.passportIssuedBy
      );
    return true;
  };

  const selectedTrip = trips.find((t) => t.id === form.tripId);
  const isCC = form.paymentMethod === "credit_card";
  const totalCents = isCC ? 124680 : 120000; // $1,246.80 or $1,200.00
  const displayTotal = isCC ? "$1,246.80" : "$1,200.00";
  const displayFee = isCC ? "3.9% processing fee" : "No processing fee";

  // Success state
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
            {selectedTrip && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Trip</span>
                <span className="font-semibold">{selectedTrip.title}</span>
              </div>
            )}
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

  // Step 4 is now handled inline below (payment method + embedded checkout combined)

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-14">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
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
                    Home Phone <span className="text-neutral-400 normal-case tracking-normal">(optional)</span>
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
                Choose Your Tour
              </h2>
              <p className="text-neutral-500 text-sm mb-8">
                Select the trip you&apos;d like to join.
              </p>
              <div className="flex flex-col gap-3">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => update("tripId", trip.id)}
                    className={`w-full text-left p-5 border-2 transition-all ${
                      form.tripId === trip.id
                        ? "border-accent bg-green-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold uppercase tracking-wider text-sm">
                          {trip.title}
                        </p>
                        <p className="text-neutral-500 text-sm mt-1">
                          Departing{" "}
                          {new Date(trip.departureDate).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ${
                          form.tripId === trip.id
                            ? "border-accent bg-accent"
                            : "border-neutral-300"
                        }`}
                      >
                        {form.tripId === trip.id && (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {trips.length === 0 && (
                  <p className="text-neutral-400 py-8 text-center">
                    Loading available tours...
                  </p>
                )}
              </div>
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
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                Payment Method
              </h2>
              <p className="text-neutral-500 text-sm mb-8">
                Choose how you&apos;d like to pay your <strong>$1,200</strong>{" "}
                deposit.
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
                      <p className="font-bold">$1,200.00</p>
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
                      <p className="font-bold">$1,246.80</p>
                      <p className="text-neutral-400 text-xs">3.9% fee</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Order summary */}
              <div className="bg-green-50 border border-green-200 p-5 mt-8 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-500">Trip deposit</span>
                  <span>$1,200.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-500">Processing fee</span>
                  <span>{isCC ? "$46.80" : "$0.00"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200 font-bold">
                  <span>Total</span>
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
                  payment method for the deposit amount shown above. I understand
                  my registration will not be complete until the deposit payment
                  is received. <span className="text-neutral-400">ARC-31-76913-5</span>
                </span>
              </label>

              {/* Embedded Square Payment */}
              {authorized && (
                <SquarePayment
                  method={form.paymentMethod as "credit_card" | "ach"}
                  transactionId={form.tripId}
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
              onClick={() => { setStep(2); setAuthorized(false); }}
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
