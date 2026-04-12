import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Shobra Admin",
    },
  });

  // Seed the two current trips
  await prisma.trip.upsert({
    where: { slug: "turkey-highlight-tour-seven-churches" },
    update: {},
    create: {
      title: "Turkey Highlight Tour with Seven Churches of Revelation",
      slug: "turkey-highlight-tour-seven-churches",
      description:
        "Small group exploration of Istanbul, Bursa, Kusadasi, Ephesus, and Cappadocia with optional cultural experiences and concluding in Istanbul or Ankara.",
      destinations: "Istanbul, Bursa, Kusadasi, Ephesus, Cappadocia",
      duration: "13 days",
      departureDate: new Date("2025-09-14"),
      returnDate: new Date("2025-09-26"),
      groupSize: "Small group",
      pricePerPerson: 4500,
      published: true,
      featured: true,
    },
  });

  await prisma.trip.upsert({
    where: { slug: "sunrise-at-machu-picchu" },
    update: {},
    create: {
      title: "Sunrise at Machu Picchu",
      slug: "sunrise-at-machu-picchu",
      description:
        "10 days, 9 nights exploring Lima, Cusco, Sacred Valley, and Machu Picchu. Includes private guided tours, accommodations, domestic flights, and select meals.",
      destinations: "Lima, Cusco, Sacred Valley, Machu Picchu",
      duration: "10 days, 9 nights",
      departureDate: new Date("2025-05-12"),
      returnDate: new Date("2025-05-21"),
      groupSize: "25-30 passengers",
      pricePerPerson: 3500,
      published: true,
      featured: true,
    },
  });

  // Seed the existing testimonials as approved reviews
  const testimonials = [
    {
      name: "Corazon Baltazar Calalang",
      content:
        "Thank you very much to Tessie Peralta for arranging a boutique tour — small group, first class accommodations and authentic dining experiences. Super grateful for the memories made with family and new friends that will last forever.",
    },
    {
      name: "Delia Aguinaldo",
      content:
        "I have traveled with Shobra Travel Agency spearheaded by Ms. Teresita Peralta and the most I can say is that we got the best accommodations and have seen beautiful historical, cultural and spiritual places unexpectedly.",
    },
    {
      name: "Dinah Lewkowicz",
      content:
        "A well curated journey, a well balanced travel that cater to older clients. The places we have been to has a lot of archeological, historical and biblical sites. To me, these are priceless. Absolutely beautiful places. Will definitely travel with this agency again.",
    },
    {
      name: "Angelita Tugade Fabros",
      content:
        "Thank you for inviting me to your travel and tour. My experience was nothing but incredible! It was hassle free and all my expectations were met far and beyond. South Africa was my first tour. Landscape was fantastic and the Safari was an unforgettable experience.",
    },
  ];

  for (const t of testimonials) {
    const exists = await prisma.review.findFirst({
      where: { name: t.name },
    });
    if (!exists) {
      await prisma.review.create({
        data: { ...t, rating: 5, approved: true },
      });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
