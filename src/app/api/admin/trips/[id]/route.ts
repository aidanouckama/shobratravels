import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  // Delete existing dates and recreate
  await prisma.tripDate.deleteMany({ where: { tripId: id } });

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      destinations: body.destinations,
      duration: body.duration,
      groupSize: body.groupSize || null,
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

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  const trip = await prisma.trip.update({
    where: { id },
    data: { archived: body.archived },
  });

  return NextResponse.json(trip);
}

export async function DELETE(_req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  await prisma.trip.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
