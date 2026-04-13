import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const trips = await prisma.trip.findMany({
    where: { published: true, archived: false },
    select: {
      id: true,
      slug: true,
      title: true,
      pricePerPerson: true,
      duration: true,
      dates: {
        select: {
          id: true,
          departureDate: true,
          returnDate: true,
        },
        orderBy: { departureDate: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });
  return NextResponse.json(trips);
}
