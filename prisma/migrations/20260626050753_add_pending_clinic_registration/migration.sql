-- CreateTable
CREATE TABLE "pending_clinic_registrations" (
    "id" TEXT NOT NULL,
    "owner_doctor_name" TEXT NOT NULL,
    "gmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "speciality" TEXT NOT NULL,
    "medical_council_reg_no" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "qualification" TEXT NOT NULL,
    "clinic_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "consultations_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "about_of_clinic" TEXT,
    "otp_hash" TEXT NOT NULL,
    "otp_expires_at" TIMESTAMP(3) NOT NULL,
    "otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_otp_sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_clinic_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_clinic_registrations_gmail_key" ON "pending_clinic_registrations"("gmail");

-- CreateIndex
CREATE INDEX "pending_clinic_registrations_gmail_idx" ON "pending_clinic_registrations"("gmail");
