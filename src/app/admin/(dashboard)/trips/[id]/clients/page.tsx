import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TripClientsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          client: true,
          tripDate: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!trip) {
    return <p className="p-6 text-neutral-500">Trip not found.</p>;
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "FULLY_PAID":
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-700">
            Fully Paid
          </span>
        );
      case "DEPOSIT_PAID":
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-700">
            Deposit Paid
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-500">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/trips"
          className="flex items-center gap-1 text-accent hover:underline text-sm uppercase tracking-wider mb-4"
        >
          <ArrowLeft size={14} /> Back to Trips
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wider">
          {trip.title}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {trip.registrations.length} registration
          {trip.registrations.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        {trip.registrations.length === 0 ? (
          <p className="p-6 text-neutral-500">
            No registrations for this trip yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3">Client Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Trip Date</th>
                <th className="px-6 py-3">Passport</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Amount Paid</th>
                <th className="px-6 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {trip.registrations.map((reg) => {
                const totalPaid = reg.payments
                  .filter((p) => p.status === "COMPLETED")
                  .reduce((sum, p) => sum + p.amount, 0);

                return (
                  <tr key={reg.id} className="border-b border-neutral-100">
                    <td className="px-6 py-3 font-medium">
                      {reg.client.fullName}
                    </td>
                    <td className="px-6 py-3">{reg.client.email}</td>
                    <td className="px-6 py-3">{reg.client.phone}</td>
                    <td className="px-6 py-3">
                      {reg.tripDate.departureDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3">
                      {reg.passportImage ? (
                        <a
                          href={reg.passportImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-neutral-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-3">{statusBadge(reg.status)}</td>
                    <td className="px-6 py-3">
                      ${totalPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-neutral-500">
                      {reg.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
