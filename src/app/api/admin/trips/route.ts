import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const trip = await prisma.trip.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      destinations: body.destinations,
      duration: body.duration,
      groupSizeMin: body.groupSizeMin ?? null,
      groupSizeMax: body.groupSizeMax ?? null,
      pricePerPerson: body.pricePerPerson,
      singleSupplement: body.singleSupplement || null,
      inclusions: body.inclusions || null,
      exclusions: body.exclusions || null,
      heroImage: body.heroImage || null,
      pdfUrl: body.pdfUrl || null,
      published: body.published,
      featured: body.featured,
      dates: {
        create: (body.dates as { departureDate: string; returnDate: string }[]).map(
          (d) => ({
            departureDate: new Date(d.departureDate),
            returnDate: new Date(d.returnDate),
          })
        ),
      },
    },
    include: { dates: true },
  });

  return NextResponse.json(trip);
}
