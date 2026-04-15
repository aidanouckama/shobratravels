import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import TripForm from "../../TripForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditTripPage({ params }: Props) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { dates: { orderBy: { departureDate: "asc" } } },
  });
  if (!trip) notFound();

  const tripData = {
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    description: trip.description,
    destinations: trip.destinations,
    duration: trip.duration,
    dates: trip.dates.map((d) => ({
      departureDate: d.departureDate.toISOString().split("T")[0],
      returnDate: d.returnDate.toISOString().split("T")[0],
    })),
    groupSizeMin: trip.groupSizeMin ?? 0,
    groupSizeMax: trip.groupSizeMax ?? 0,
    pricePerPerson: trip.pricePerPerson,
    singleSupplement: trip.singleSupplement || 0,
    inclusions: trip.inclusions || "",
    exclusions: trip.exclusions || "",
    heroImage: trip.heroImage || "",
    pdfUrl: trip.pdfUrl || "",
    published: trip.published,
    featured: trip.featured,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-8">
        Edit Trip
      </h1>
      <TripForm trip={tripData} />
    </div>
  );
}
