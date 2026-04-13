import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse photos from our cultural and historical tours.",
};

export default async function GalleryPage() {
  const trips = await prisma.trip.findMany({
    where: { published: true, archived: false, galleryImages: { isEmpty: false } },
    select: { title: true, galleryImages: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  const allImages = trips.flatMap((trip) =>
    trip.galleryImages.map((img) => ({ src: img, tripTitle: trip.title }))
  );

  return (
    <>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider">
            Gallery
          </h1>
          <p className="text-green-200/70 mt-4 text-lg">
            Moments captured from our tours around the world.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allImages.length === 0 ? (
            <p className="text-center text-neutral-500 text-lg py-20">
              Gallery photos coming soon!
            </p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {allImages.map((img, i) => (
                <div key={i} className="mb-4 break-inside-avoid group relative">
                  <img
                    src={img.src}
                    alt={img.tripTitle}
                    className="w-full"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium uppercase tracking-wider">
                      {img.tripTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
