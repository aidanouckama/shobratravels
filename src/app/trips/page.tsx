import Link from "next/link";
import { Calendar, Users, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatGroupSize, truncateDestinations } from "@/lib/trip";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Trips",
  description:
    "Browse Shobra Travel Agency's upcoming small-group cultural and historical tours — expertly curated itineraries with boutique hotels, local guides, and all-inclusive departures.",
  alternates: { canonical: "/trips" },
  openGraph: {
    title: "Upcoming Trips",
    description:
      "Browse Shobra Travel Agency's upcoming small-group cultural and historical tours.",
    url: "/trips",
  },
};

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    where: { published: true, archived: false },
    include: {
      dates: { orderBy: { departureDate: "asc" } },
    },
    orderBy: { title: "asc" },
  });

  return (
    <>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
            Upcoming Trips
          </h1>
          <p className="text-green-200/70 mt-4 text-lg">
            Explore our curated collection of cultural and historical boutique
            tours.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {trips.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">
                No upcoming trips at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trips.map((trip) => {
                const nextDate = trip.dates[0];
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.slug}`}
                    className="group border border-neutral-200 hover:border-accent transition-colors"
                  >
                    {trip.heroImage && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={trip.heroImage}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold uppercase tracking-wider mb-3 group-hover:text-accent transition-colors">
                        {trip.title}
                      </h2>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-4">
                        {nextDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {nextDate.departureDate.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="shrink-0" />
                          {truncateDestinations(trip.destinations)}
                        </span>
                        {formatGroupSize(trip.groupSizeMin, trip.groupSizeMax) && (
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {formatGroupSize(trip.groupSizeMin, trip.groupSizeMax)}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600 line-clamp-2 mb-4">
                        {trip.description}
                      </p>
                      <p className="font-bold text-lg">
                        From ${trip.pricePerPerson.toLocaleString()} / person
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
