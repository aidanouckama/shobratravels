import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import BookPage from "./BookPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({ where: { slug } });
  if (!trip) return {};
  return {
    title: `Book ${trip.title}`,
    description: `Register and pay your deposit for ${trip.title}.`,
  };
}

export default async function TripBookPage({ params }: Props) {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({
    where: { slug, published: true, archived: false },
    include: {
      dates: {
        orderBy: { departureDate: "asc" },
        include: {
          _count: {
            select: {
              registrations: { where: { status: { not: "CANCELLED" } } },
            },
          },
        },
      },
    },
  });

  if (!trip) notFound();

  const max = trip.groupSizeMax;
  const tripData = {
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    pricePerPerson: trip.pricePerPerson,
    singleSupplement: trip.singleSupplement,
    duration: trip.duration,
    destinations: trip.destinations,
    groupSizeMax: max,
    dates: trip.dates.map((d) => {
      const booked = d._count.registrations;
      const spotsLeft = max ? Math.max(0, max - booked) : null;
      return {
        id: d.id,
        departureDate: d.departureDate.toISOString(),
        returnDate: d.returnDate.toISOString(),
        spotsLeft,
        soldOut: max !== null && booked >= max,
      };
    }),
  };

  return <BookPage trip={tripData} />;
}
