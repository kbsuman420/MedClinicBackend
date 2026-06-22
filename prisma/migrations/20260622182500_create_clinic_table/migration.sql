/*
  Warnings:

  - You are about to drop the column `doctor_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the `doctors` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[gmail]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[medical_council_reg_no]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_name` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gmail` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medical_council_reg_no` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_doctor_name` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualification` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speciality` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `clinics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `patients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('pending', 'approved');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('active', 'closed');

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_clinic_id_fkey";

-- DropIndex
DROP INDEX "appointments_doctor_id_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "doctor_id";

-- AlterTable
ALTER TABLE "clinics" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "about_of_clinic" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "clinic_name" TEXT NOT NULL,
ADD COLUMN     "consultations_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "current_active_status" "ActiveStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "experience" INTEGER NOT NULL,
ADD COLUMN     "gmail" TEXT NOT NULL,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medical_council_reg_no" TEXT NOT NULL,
ADD COLUMN     "owner_doctor_name" TEXT NOT NULL,
ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ADD COLUMN     "qualification" TEXT NOT NULL,
ADD COLUMN     "speciality" TEXT NOT NULL,
ADD COLUMN     "status" "ClinicStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "doctors";

-- CreateIndex
CREATE UNIQUE INDEX "clinics_gmail_key" ON "clinics"("gmail");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_phone_key" ON "clinics"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_medical_council_reg_no_key" ON "clinics"("medical_council_reg_no");

ALTER TABLE "clinics"
ADD CONSTRAINT "consultations_fee_positive"
CHECK ("consultations_fee" > 0);