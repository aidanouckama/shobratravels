import { notFound } from "next/navigation";
import { Calendar, Users, MapPin, Clock, FileText, Check } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import TripBooking from "./TripBooking";
import DatesDropdown from "./DatesDropdown";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({ where: { slug } });
  if (!trip) return {};
  return { title: trip.title, description: trip.description.slice(0, 160) };
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({
    where: { slug, published: true, archived: false },
    include: { dates: { orderBy: { departureDate: "asc" } } },
  });

  if (!trip) notFound();

  return (
    <>
      {trip.heroImage && (
        <div className="relative h-[50vh] md:h-[60vh]">
          <img
            src={trip.heroImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-white">
              {trip.title}
            </h1>
          </div>
        </div>
      )}

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {!trip.heroImage && (
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-8">
                  {trip.title}
                </h1>
              )}

              {/* Embedded Itinerary PDF */}
              {trip.pdfUrl ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider">
                      Itinerary
                    </h2>
                    <a
                      href={trip.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dark uppercase tracking-wider font-semibold transition-colors"
                    >
                      <FileText size={14} />
                      Download PDF
                    </a>
                  </div>
                  <div className="border border-neutral-200 bg-neutral-50">
                    <iframe
                      src={`${trip.pdfUrl}#toolbar=0&navpanes=0`}
                      className="w-full"
                      style={{ height: "80vh", minHeight: "600px" }}
                      title={`${trip.title} Itinerary`}
                    />
                  </div>
                </div>
              ) : (
                <div className="prose prose-neutral max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-line">
                    {trip.description}
                  </p>
                </div>
              )}

              {trip.galleryImages.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold uppercase tracking-wider mb-4">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trip.galleryImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${trip.title} - ${i + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-green-50 p-8 border border-neutral-200">
                <p className="text-3xl font-bold mb-1">
                  ${trip.pricePerPerson.toLocaleString()}
                </p>
                <p className="text-neutral-500 text-sm mb-1">
                  per person (double occupancy)
                </p>
                <p className="text-accent text-xs font-medium mb-6">
                  $1,200 deposit &middot; balance due 90 days before travel
                </p>

                <div className="flex flex-col gap-3 text-sm mb-8">
                  <DatesDropdown
                    dates={trip.dates.map((d) => ({
                      departureDate: d.departureDate.toISOString(),
                      returnDate: d.returnDate.toISOString(),
                    }))}
                  />
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Clock size={16} />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin size={16} />
                    <span>{trip.destinations}</span>
                  </div>
                  {trip.groupSize && (
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Users size={16} />
                      <span>{trip.groupSize}</span>
                    </div>
                  )}
                </div>

                <TripBooking tripSlug={trip.slug} dateCount={trip.dates.length} />

                <div className="mt-6 pt-6 border-t border-green-200">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
                    What&apos;s Included
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      "Private guided tours",
                      "Accommodations included",
                      "Select meals provided",
                      "Small group experience",
                      "24/7 travel support",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check size={14} className="text-accent shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
