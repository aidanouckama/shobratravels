"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import BookingForm from "@/components/BookingForm";

type TripDate = {
  id: string;
  departureDate: string;
  returnDate: string;
};

type Trip = {
  id: string;
  title: string;
  slug: string;
  pricePerPerson: number;
  singleSupplement: number | null;
  duration: string;
  destinations: string;
  dates: TripDate[];
};

export default function BookPage({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [selectedDateId, setSelectedDateId] = useState("");

  const selectedDate = trip.dates.find((d) => d.id === selectedDateId);

  return (
    <>
      {/* Header */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <button
            onClick={() => router.push(`/trips/${trip.slug}`)}
            className="flex items-center gap-2 text-green-300/80 hover:text-white text-sm uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Trip
          </button>
          <p className="text-accent-light text-sm uppercase tracking-[0.3em] mb-3">
            Book Your Trip
          </p>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider">
            {trip.title}
          </h1>
          <div className="flex flex-wrap gap-3 md:gap-6 mt-6 text-sm text-green-200/60">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {trip.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {trip.destinations}
            </span>
            <span className="font-semibold text-white">
              ${trip.pricePerPerson.toLocaleString()} per person
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Date Selection + Booking Form */}
            <div className="lg:col-span-3">
              {!selectedDateId ? (
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                    Select Your Dates
                  </h2>
                  <p className="text-neutral-500 text-sm mb-8">
                    Choose your preferred travel dates to continue.
                  </p>
                  <div className="flex flex-col gap-3">
                    {trip.dates.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDateId(d.id)}
                        className="w-full text-left p-5 border-2 border-neutral-200 hover:border-accent transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-50 flex items-center justify-center shrink-0">
                            <Calendar size={20} className="text-accent" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              {new Date(d.departureDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}{" "}
                              –{" "}
                              {new Date(d.returnDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-neutral-500 text-xs mt-1">
                              {trip.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <BookingForm
                  tripId={trip.id}
                  tripDateId={selectedDateId}
                  tripTitle={trip.title}
                  tripPrice={trip.pricePerPerson}
                  singleSupplement={trip.singleSupplement}
                  departureDate={selectedDate!.departureDate}
                  returnDate={selectedDate!.returnDate}
                  onClose={() => setSelectedDateId("")}
                />
              )}
            </div>

            {/* Right: Trip Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-green-50 border border-green-200 p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">
                  Trip Summary
                </h3>
                <p className="font-bold uppercase tracking-wider text-sm mb-3">
                  {trip.title}
                </p>
                {selectedDate && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                    <Calendar size={14} className="text-accent" />
                    <span>
                      {new Date(selectedDate.departureDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}{" "}
                      –{" "}
                      {new Date(selectedDate.returnDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t border-green-200 pt-3 mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Trip price</span>
                    <span>${trip.pricePerPerson.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-accent">
                    <span>Deposit due today</span>
                    <span>$1,200.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Remaining balance</span>
                    <span>
                      $
                      {(trip.pricePerPerson - 1200).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 pt-1">
                    Balance due 90 days before departure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
