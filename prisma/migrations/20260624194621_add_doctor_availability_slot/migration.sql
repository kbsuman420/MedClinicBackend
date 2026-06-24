-- CreateTable
CREATE TABLE "doctor_availability_slots" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_availability_slots_clinic_id_idx" ON "doctor_availability_slots"("clinic_id");

-- CreateIndex
CREATE INDEX "doctor_availability_slots_day_of_week_idx" ON "doctor_availability_slots"("day_of_week");

-- AddForeignKey
ALTER TABLE "doctor_availability_slots" ADD CONSTRAINT "doctor_availability_slots_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
