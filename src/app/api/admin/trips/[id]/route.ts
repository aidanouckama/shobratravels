import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

type IncomingDate = { departureDate: string; returnDate: string };

const dateKey = (d: Date | string) =>
  (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);

export async function PUT(req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  const incoming = (body.dates as IncomingDate[]) ?? [];
  const incomingKeys = new Set(
    incoming.map((d) => `${dateKey(d.departureDate)}_${dateKey(d.returnDate)}`),
  );

  const existing = await prisma.tripDate.findMany({
    where: { tripId: id },
    include: { _count: { select: { registrations: true } } },
  });

  const existingKeys = new Set(
    existing.map((d) => `${dateKey(d.departureDate)}_${dateKey(d.returnDate)}`),
  );

  const toDelete = existing.filter((d) => {
    const key = `${dateKey(d.departureDate)}_${dateKey(d.returnDate)}`;
    return !incomingKeys.has(key) && d._count.registrations === 0;
  });

  const blockedRemovals = existing.filter((d) => {
    const key = `${dateKey(d.departureDate)}_${dateKey(d.returnDate)}`;
    return !incomingKeys.has(key) && d._count.registrations > 0;
  });

  if (blockedRemovals.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot remove trip dates that already have registrations: " +
          blockedRemovals
            .map((d) => `${dateKey(d.departureDate)} → ${dateKey(d.returnDate)}`)
            .join(", "),
      },
      { status: 409 },
    );
  }

  const toCreate = incoming.filter((d) => {
    const key = `${dateKey(d.departureDate)}_${dateKey(d.returnDate)}`;
    return !existingKeys.has(key);
  });

  const trip = await prisma.$transaction(async (tx) => {
    if (toDelete.length > 0) {
      await tx.tripDate.deleteMany({
        where: { id: { in: toDelete.map((d) => d.id) } },
      });
    }
    return tx.trip.update({
      where: { id },
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
          create: toCreate.map((d) => ({
            departureDate: new Date(d.departureDate),
            returnDate: new Date(d.returnDate),
          })),
        },
      },
      include: { dates: true },
    });
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
