import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Star, ArrowRight, Quote } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  other: {
    "websitelaunches-verification": "dd527da1e9f0356cbefda8a7b769a347",
  },
};

const pillars = [
  {
    number: "01",
    title: "Elevated Experiences",
    description:
      "Work directly with our team of expert advisors to design and execute extraordinary, fully customized itineraries tailored to your desires.",
  },
  {
    number: "02",
    title: "Cultural Immersion",
    description:
      "Capture the essence of every destination — immerse yourself in local customs, traditions, and authentic experiences that inspire.",
  },
  {
    number: "03",
    title: "Trusted Partners",
    description:
      "We&apos;ve partnered with the finest hotels and local operators worldwide to guarantee seamless, world-class travel from start to finish.",
  },
  {
    number: "04",
    title: "VIP Treatment",
    description:
      "Exclusively vetted suppliers, eco-conscious practices, and unmatched personal service — because you deserve nothing less.",
  },
];

const testimonials = [
  {
    name: "Corazon Baltazar Calalang",
    location: "Manila, Philippines",
    quote:
      "Thank you very much to Tessie Peralta for arranging a boutique tour — small group, first class accommodations and authentic dining experiences. Super grateful for the memories made with family and new friends that will last forever.",
  },
  {
    name: "Delia Aguinaldo",
    location: "New Jersey, USA",
    quote:
      "I have traveled with Shobra Travel Agency spearheaded by Ms. Teresita Peralta and the most I can say is that we got the best accommodations and have seen beautiful historical, cultural and spiritual places unexpectedly.",
  },
  {
    name: "Dinah Lewkowicz",
    location: "Short Hills, NJ",
    quote:
      "A well curated journey, a well balanced travel that caters to older clients. The places we have been to has a lot of archeological, historical and biblical sites. To me, these are priceless. Absolutely beautiful places.",
  },
];

export default async function HomePage() {
  const featuredTrips = await prisma.trip.findMany({
    where: { published: true, featured: true, archived: false },
    include: { dates: { orderBy: { departureDate: "asc" } } },
    take: 3,
  });
  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary text-white min-h-[85vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <p className="text-accent-light text-sm uppercase tracking-[0.3em] mb-6">
            Cultural &bull; Historical &bull; Boutique
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-wider mb-8 leading-[1.1]">
            Discover the
            <br />
            World&apos;s Most
            <br />
            <span className="text-accent-light">Incredible</span>
            <br />
            Destinations
          </h1>
          <p className="text-lg text-green-200/60 max-w-md mb-12 leading-relaxed">
            Stop settling for plain, uninspired vacations. Our boutique
            experiences are curated specifically for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/trips"
              className="group bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4 uppercase tracking-wider text-sm transition-colors inline-flex items-center gap-3"
            >
              View All Trips
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/trips"
              className="border border-white/30 hover:bg-white hover:text-primary px-8 py-4 uppercase tracking-wider text-sm transition-colors"
            >
              Browse Trips
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      {featuredTrips.length > 0 && (
        <section className="py-24 md:py-36 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-accent text-sm uppercase tracking-[0.3em] mb-3">
                Explore
              </p>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider">
                Featured Trips
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featuredTrips.map((trip) => {
                const nextDate = trip.dates[0];
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.slug}`}
                    className="group bg-white border border-neutral-200 hover:border-accent transition-colors overflow-hidden"
                  >
                    {trip.heroImage && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={trip.heroImage}
                          alt={trip.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-accent text-xs uppercase tracking-[0.2em] mb-2">
                        {trip.destinations}
                      </p>
                      <h3 className="text-lg font-bold uppercase tracking-wider mb-3">
                        {trip.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                        {nextDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {nextDate.departureDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <span className="font-semibold text-primary">
                          ${trip.pricePerPerson.toLocaleString()}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-accent text-sm font-semibold uppercase tracking-wider group-hover:gap-3 transition-all">
                        View Trip
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pillars — editorial numbered list */}
      <section className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mb-20">
            <p className="text-accent text-sm uppercase tracking-[0.3em] mb-3">
              Why Shobra
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider leading-tight">
              Travel With
              <br />
              Confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
            {pillars.map((pillar) => (
              <div
                key={pillar.number}
                className="group flex gap-6 items-start"
              >
                <span className="text-4xl md:text-5xl font-bold text-green-100 group-hover:text-accent transition-colors shrink-0 leading-none">
                  {pillar.number}
                </span>
                <div className="pt-1">
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed text-[15px]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — full-bleed */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-lg">
            <p className="text-accent-light text-sm uppercase tracking-[0.3em] mb-3">
              Limited Spots
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-green-200/60 leading-relaxed">
              Register and pay securely online. We handle the rest —
              flights, accommodations, tours, and unforgettable memories.
            </p>
          </div>
          <Link
            href="/trips"
            className="group bg-accent hover:bg-accent-dark text-white font-semibold px-10 py-4 uppercase tracking-wider text-sm transition-colors inline-flex items-center gap-3 shrink-0"
          >
            Browse Trips
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>

      {/* Testimonials — editorial pull-quote style */}
      <section className="py-24 md:py-36 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-accent text-sm uppercase tracking-[0.3em] mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider">
              Traveler Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-green-200">
            {testimonials.map((t, i) => (
              <div key={t.name} className="px-4 md:px-10 py-10 md:py-0 relative">
                <Quote
                  size={32}
                  className="text-accent/20 mb-6"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <p className="text-neutral-600 leading-relaxed mb-8 text-[15px]">
                  {t.quote}
                </p>
                <div className="flex items-center gap-1 text-accent mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} fill="currentColor" />
                  ))}
                </div>
                <p className="font-bold uppercase tracking-wider text-sm">
                  {t.name}
                </p>
                <p className="text-neutral-400 text-xs mt-1 tracking-wider">
                  {t.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
