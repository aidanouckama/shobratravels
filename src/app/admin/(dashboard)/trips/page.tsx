import Link from "next/link";
import { prisma } from "@/lib/db";
import { Plus, Pencil, Eye, EyeOff, Users } from "lucide-react";
import DeleteTripButton from "./DeleteTripButton";

export default async function AdminTripsPage() {
  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      dates: { orderBy: { departureDate: "asc" }, take: 1 },
      _count: { select: { registrations: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Trips</h1>
        <Link
          href="/admin/trips/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-2.5 uppercase tracking-wider text-sm transition-colors"
        >
          <Plus size={16} />
          New Trip
        </Link>
      </div>

      <div className="bg-white border border-neutral-200">
        {trips.length === 0 ? (
          <p className="p-6 text-neutral-500">
            No trips yet. Create your first one!
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3">Trip</th>
                <th className="px-6 py-3">Departure</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Registrations</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-neutral-100">
                  <td className="px-6 py-3">
                    <p className="font-medium">{trip.title}</p>
                    <p className="text-neutral-500 text-xs">
                      {trip.destinations}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    {trip.dates[0]
                      ? trip.dates[0].departureDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No dates"}
                  </td>
                  <td className="px-6 py-3">
                    ${trip.pricePerPerson.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">{trip._count.registrations}</td>
                  <td className="px-6 py-3">
                    {trip.published ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Eye size={14} /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-400">
                        <EyeOff size={14} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/trips/${trip.id}/edit`}
                        className="flex items-center gap-1 text-accent hover:underline"
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                      <Link
                        href={`/admin/trips/${trip.id}/clients`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Users size={14} /> Clients
                      </Link>
                      <DeleteTripButton tripId={trip.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
