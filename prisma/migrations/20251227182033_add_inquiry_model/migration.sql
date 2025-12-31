/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `agents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'AGENT';

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "experience" INTEGER DEFAULT 0,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "is_top_agent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "office_address" VARCHAR(255),
ADD COLUMN     "office_lat" DOUBLE PRECISION,
ADD COLUMN     "office_lng" DOUBLE PRECISION,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "review_count" INTEGER DEFAULT 0,
ADD COLUMN     "specialties" TEXT,
ADD COLUMN     "user_id" INTEGER,
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "description" TEXT,
ADD COLUMN     "short_description" VARCHAR(255),
ADD COLUMN     "source_url" TEXT;

-- CreateTable
CREATE TABLE "page_views" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "session_id" VARCHAR(100),
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_languages" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_specializations" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "specialization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" SERIAL NOT NULL,
    "property_id" UUID NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "client_name" VARCHAR(150) NOT NULL,
    "client_phone" VARCHAR(50),
    "client_email" VARCHAR(255),
    "deal_type" VARCHAR(10) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "category" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_amenities" (
    "id" SERIAL NOT NULL,
    "property_id" UUID NOT NULL,
    "amenity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" SERIAL NOT NULL,
    "property_id" UUID NOT NULL,
    "image_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" SERIAL NOT NULL,
    "property_id" UUID NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "message" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'TOUR',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_languages_agent_id_language_id_key" ON "agent_languages"("agent_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_name_key" ON "specializations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_specializations_agent_id_specialization_id_key" ON "agent_specializations"("agent_id", "specialization_id");

-- CreateIndex
CREATE INDEX "deals_agent_id_idx" ON "deals"("agent_id");

-- CreateIndex
CREATE INDEX "deals_status_idx" ON "deals"("status");

-- CreateIndex
CREATE INDEX "idx_property_amenities_property" ON "property_amenities"("property_id");

-- CreateIndex
CREATE INDEX "idx_property_amenities_amenity" ON "property_amenities"("amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_amenities_property_id_amenity_id_key" ON "property_amenities"("property_id", "amenity_id");

-- CreateIndex
CREATE INDEX "idx_property_images_property" ON "property_images"("property_id");

-- CreateIndex
CREATE INDEX "idx_inquiries_agent" ON "inquiries"("agent_id");

-- CreateIndex
CREATE INDEX "idx_inquiries_status" ON "inquiries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "agents_user_id_key" ON "agents"("user_id");

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_languages" ADD CONSTRAINT "agent_languages_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_languages" ADD CONSTRAINT "agent_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_specializations" ADD CONSTRAINT "agent_specializations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_specializations" ADD CONSTRAINT "agent_specializations_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
