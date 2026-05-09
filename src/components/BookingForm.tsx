"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  BookOpen,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Upload,
  X as XIcon,
  Loader2,
  Lock,
  Info,
} from "lucide-react";
import SquarePayment from "@/components/SquarePayment";
import { COUNTRIES } from "@/lib/countries";
import { formatPhoneInput, isValidPhone } from "@/lib/phone";
import { track } from "@/lib/analytics";

const DEPOSIT = 1200;
const CC_FEE_RATE = 0.039;

const STEPS = [
  { label: "Booking", icon: ClipboardList },
  { label: "Passport", icon: BookOpen },
  { label: "Payment", icon: CreditCard },
];

type Props = {
  tripId: string;
  tripDateId: string;
  tripTitle: string;
  tripPrice: number;
  singleSupplement: number | null;
  departureDate: string;
  returnDate: string;
  onClose: () => void;
};

export default function BookingForm({
  tripId,
  tripDateId,
  tripTitle,
  tripPrice,
  singleSupplement,
  departureDate,
  returnDate,
  onClose,
}: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [singleOccupancy, setSingleOccupancy] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    cellPhone: "",
    homePhone: "",
    address: "",
    passportNumber: "",
    passportCountry: "",
    passportIssued: "",
    passportExpiry: "",
    passportIssuedBy: "",
    passportImage: "",
    paymentMethod: "ach",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    track("registration_started", { trip_title: tripTitle, trip_id: tripId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFullSubmit = async (sourceId: string) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tripId,
          tripDateId,
          sourceId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      setSubmitted(true);
      const isCCPayment = form.paymentMethod === "credit_card";
      const ccFeeAmount = Math.round(DEPOSIT * CC_FEE_RATE * 100) / 100;
      track("registration_completed", {
        trip_title: tripTitle,
        trip_id: tripId,
        payment_method: form.paymentMethod,
        value: isCCPayment ? DEPOSIT + ccFeeAmount : DEPOSIT,
        currency: "USD",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 0)
      return (
        form.fullName &&
        form.email &&
        form.cellPhone &&
        isValidPhone(form.cellPhone) &&
        (!form.homePhone || isValidPhone(form.homePhone)) &&
        form.address
      );
    if (step === 1) {
      const expiryValid =
        form.passportIssued &&
        form.passportExpiry &&
        Date.parse(form.passportExpiry) > Date.parse(form.passportIssued);
      return (
        form.passportNumber &&
        form.passportCountry &&
        form.passportIssued &&
        form.passportExpiry &&
        expiryValid &&
        form.passportIssuedBy &&
        form.passportImage
      );
    }
    return true;
  };

  const supplementAmount = singleOccupancy && singleSupplement ? singleSupplement : 0;
  const fullTripPrice = tripPrice + supplementAmount;
  const isCC = form.paymentMethod === "credit_card";
  const ccFee = Math.round(DEPOSIT * CC_FEE_RATE * 100) / 100;
  const totalAmount = isCC ? DEPOSIT + ccFee : DEPOSIT;
  const totalCents = Math.round(totalAmount * 100);
  const displayTotal = `$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const displayFee = isCC ? "3.9% processing fee" : "No processing fee";
  const remaining = fullTripPrice - DEPOSIT;
  const departureDateObj = new Date(departureDate);
  const dueDate = new Date(departureDateObj);
  dueDate.setDate(dueDate.getDate() - 90); // 90 days before travel

  if (submitted) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-accent/10 mx-auto mb-6 flex items-center justify-center">
          <div className="w-11 h-11 bg-accent flex items-center justify-center">
            <Check size={22} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-3">
          Booking Confirmed
        </h2>
        <p className="text-neutral-500 mb-6">
          Your deposit has been received. Confirmation sent to{" "}
          <strong>{form.email}</strong>.
        </p>
        <div className="bg-green-50 border border-green-200 p-5 text-left text-sm space-y-2 max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-neutral-500">Trip</span>
            <span className="font-semibold text-right">{tripTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Deposit Paid</span>
            <span className="font-semibold">{displayTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Remaining Balance</span>
            <span className="font-semibold">
              ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Balance Due By</span>
            <span className="font-semibold">
              {dueDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Trip Context */}
      <div className="bg-green-50 border border-green-200 p-4 mb-8 text-sm">
        <p className="font-bold uppercase tracking-wider text-xs mb-1">
          {tripTitle}
        </p>
        <p className="text-neutral-500 text-xs">
          {new Date(departureDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}{" "}
          –{" "}
          {new Date(returnDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => { if (i < step) { setStep(i); setError(""); } }}
              className={`flex items-center gap-2 transition-colors ${
                i < step ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-9 h-9 flex items-center justify-center text-sm font-bold transition-all ${
                  i < step
                    ? "bg-accent text-white"
                    : i === step
                    ? "bg-primary text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {i < step ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <s.icon size={14} />
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
                className={`flex-1 h-px mx-3 transition-colors ${
                  i < step ? "bg-accent" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Personal */}
      {step === 0 && (
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wider mb-1">
            Booking Details
          </h3>
          <p className="text-neutral-500 text-xs mb-6">
            Your information and trip preferences.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                  Cell Phone
                </label>
                <input
                  type="tel"
                  required
                  value={form.cellPhone}
                  onChange={(e) => update("cellPhone", formatPhoneInput(e.target.value, form.cellPhone))}
                  placeholder="(555) 123-4567"
                  className={`w-full border-b-2 px-0 py-2 bg-transparent focus:outline-none transition-colors ${
                    form.cellPhone && !isValidPhone(form.cellPhone)
                      ? "border-red-300 focus:border-red-500"
                      : "border-neutral-200 focus:border-accent"
                  }`}
                />
                {form.cellPhone && !isValidPhone(form.cellPhone) && (
                  <p className="text-red-500 text-[11px] mt-1">Enter a valid phone number</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                  Home{" "}
                  <span className="text-neutral-400 normal-case tracking-normal">
                    (opt.)
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.homePhone}
                  onChange={(e) => update("homePhone", formatPhoneInput(e.target.value, form.homePhone))}
                  className={`w-full border-b-2 px-0 py-2 bg-transparent focus:outline-none transition-colors ${
                    form.homePhone && !isValidPhone(form.homePhone)
                      ? "border-red-300 focus:border-red-500"
                      : "border-neutral-200 focus:border-accent"
                  }`}
                />
                {form.homePhone && !isValidPhone(form.homePhone) && (
                  <p className="text-red-500 text-[11px] mt-1">Enter a valid phone number</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                Mailing Address
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="123 Main St, City, State ZIP"
                className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Occupancy */}
            {singleSupplement && singleSupplement > 0 && (
              <div className="mt-6 p-4 border-2 border-neutral-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Room Occupancy
                      </p>
                      <div className="group relative">
                        <Info size={13} className="text-neutral-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-primary text-white text-[11px] leading-relaxed p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          Double occupancy means sharing a room with another traveler. Single occupancy gives you a private room for an additional fee.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setSingleOccupancy(false)}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-2 transition-all ${
                          !singleOccupancy
                            ? "border-accent bg-green-50 text-accent"
                            : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                        }`}
                      >
                        <span className="whitespace-nowrap">Double</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleOccupancy(true)}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-2 transition-all ${
                          singleOccupancy
                            ? "border-accent bg-green-50 text-accent"
                            : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                        }`}
                      >
                        <span className="whitespace-nowrap">Single (+${singleSupplement.toLocaleString()})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Passport */}
      {step === 1 && (
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wider mb-1">
            Passport
          </h3>
          <p className="text-neutral-500 text-xs mb-6">
            Required for international travel.
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                  Passport Number
                </label>
                <input
                  type="text"
                  required
                  value={form.passportNumber}
                  onChange={(e) => update("passportNumber", e.target.value)}
                  className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  required
                  list="passport-country-list"
                  autoComplete="country-name"
                  placeholder="Start typing…"
                  value={form.passportCountry}
                  onChange={(e) => update("passportCountry", e.target.value)}
                  className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
                />
                <datalist id="passport-country-list">
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                  Date Issued
                </label>
                <input
                  type="date"
                  required
                  value={form.passportIssued}
                  onChange={(e) => update("passportIssued", e.target.value)}
                  className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                  Expiration
                </label>
                <input
                  type="date"
                  required
                  value={form.passportExpiry}
                  onChange={(e) => update("passportExpiry", e.target.value)}
                  className={`w-full border-b-2 px-0 py-2 bg-transparent focus:outline-none transition-colors ${
                    form.passportIssued &&
                    form.passportExpiry &&
                    Date.parse(form.passportExpiry) <= Date.parse(form.passportIssued)
                      ? "border-red-300 focus:border-red-500"
                      : "border-neutral-200 focus:border-accent"
                  }`}
                />
                {form.passportIssued &&
                  form.passportExpiry &&
                  Date.parse(form.passportExpiry) <= Date.parse(form.passportIssued) && (
                    <p className="text-red-500 text-[11px] mt-1">Expiry must be after issue date</p>
                  )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
                Issued By
              </label>
              <input
                type="text"
                required
                value={form.passportIssuedBy}
                onChange={(e) => update("passportIssuedBy", e.target.value)}
                placeholder="e.g. US Department of State"
                className="w-full border-b-2 border-neutral-200 px-0 py-2 bg-transparent focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Passport Photo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                Passport Photo
              </label>
              {form.passportImage ? (
                <div className="border-2 border-neutral-200 p-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={form.passportImage}
                      alt="Passport"
                      className="w-12 h-12 object-cover"
                    />
                    <p className="text-xs text-accent font-medium">Uploaded</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update("passportImage", "")}
                    className="p-1 text-neutral-400 hover:text-red-500"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-neutral-300 hover:border-accent p-5 text-center cursor-pointer transition-colors block">
                  {uploadingPassport ? (
                    <div className="flex flex-col items-center gap-1">
                      <Loader2 size={20} className="animate-spin text-accent" />
                      <p className="text-xs text-neutral-500">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={18} className="text-neutral-400" />
                      <p className="text-xs text-neutral-500">
                        Upload passport photo
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

      {/* Step 2: Payment */}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wider mb-1">
            Payment
          </h3>
          <p className="text-neutral-500 text-xs mb-6">
            $1,200 deposit today. Remaining ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
            due by{" "}
            {dueDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
            .
          </p>

          <div className="flex flex-col gap-2 mb-6">
            <button
              type="button"
              onClick={() => { update("paymentMethod", "ach"); setAuthorized(false); setError(""); }}
              className={`w-full text-left p-4 border-2 transition-all relative ${
                form.paymentMethod === "ach"
                  ? "border-accent bg-green-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-accent text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                Recommended
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                    form.paymentMethod === "ach"
                      ? "bg-accent text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  <Building2 size={15} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs uppercase tracking-wider">
                    Bank Transfer
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">$1,200.00</p>
                  <p className="text-accent text-[10px] font-semibold">No fee</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { update("paymentMethod", "credit_card"); setAuthorized(false); setError(""); }}
              className={`w-full text-left p-4 border-2 transition-all ${
                form.paymentMethod === "credit_card"
                  ? "border-accent bg-green-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                    form.paymentMethod === "credit_card"
                      ? "bg-accent text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  <CreditCard size={15} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs uppercase tracking-wider">
                    Credit Card
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">
                    ${(DEPOSIT + ccFee).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-neutral-400 text-[10px]">3.9% fee</p>
                </div>
              </div>
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-green-50 border border-green-200 p-4 text-sm mb-5">
            <div className="flex justify-between mb-1">
              <span className="text-neutral-500">
                Trip ({singleOccupancy ? "single" : "double"} occupancy)
              </span>
              <span>${fullTripPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            {supplementAmount > 0 && (
              <div className="flex justify-between mb-1 text-xs text-neutral-400">
                <span>Includes single supplement</span>
                <span>+${supplementAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between mb-1">
              <span className="text-neutral-500">Deposit</span>
              <span>$1,200.00</span>
            </div>
            {isCC && (
              <div className="flex justify-between mb-1">
                <span className="text-neutral-500">Processing fee (3.9%)</span>
                <span>${ccFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-green-200 font-bold">
              <span>Due today</span>
              <span>{displayTotal}</span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-400">
              <span>Remaining balance</span>
              <span>
                ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} due{" "}
                {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </span>
            </div>
          </div>

          {/* Authorization */}
          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-1 shrink-0"
            />
            <span className="text-[11px] text-neutral-500 leading-relaxed">
              I authorize Shobra Travel Agency, LLC to charge the selected
              payment method for the deposit amount shown above. Remaining
              balance is due 90 days before departure.{" "}
              <span className="text-neutral-400">ARC-31-76913-5</span>
            </span>
          </label>

          {authorized && (
            <SquarePayment
              key={form.paymentMethod}
              method={form.paymentMethod as "credit_card" | "ach"}
              transactionId={tripDateId}
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

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-xs">
          {error}
        </div>
      )}

      {/* Navigation — steps 0-1 only */}
      {step < 2 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => { setError(""); step === 0 ? onClose() : setStep((s) => s - 1); }}
            className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ChevronLeft size={14} />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            onClick={() => { setError(""); setStep((s) => s + 1); }}
            disabled={!canAdvance()}
            className="flex items-center gap-1 bg-primary hover:bg-primary-light text-white font-semibold px-6 py-2.5 uppercase tracking-wider text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setAuthorized(false);
            }}
            className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
      )}
    </div>
  );
}
