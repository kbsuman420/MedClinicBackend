/*
  Warnings:

  - You are about to drop the `pending_clinic_registrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pending_clinic_registrations";

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "gmail" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "otp_expires_at" TIMESTAMP(3) NOT NULL,
    "last_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_gmail_key" ON "email_verifications"("gmail");

-- CreateIndex
CREATE INDEX "email_verifications_gmail_idx" ON "email_verifications"("gmail");
