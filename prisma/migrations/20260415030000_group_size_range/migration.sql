-- Replace free-form groupSize with a min/max pair.
ALTER TABLE "Trip" DROP COLUMN "groupSize";
ALTER TABLE "Trip" ADD COLUMN "groupSizeMin" INTEGER;
ALTER TABLE "Trip" ADD COLUMN "groupSizeMax" INTEGER;
