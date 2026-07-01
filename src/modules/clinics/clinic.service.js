import { prisma } from "../../database/index.js";

export const createNewClinic = async (clinicData) => {
  return await prisma.clinic.create({
    data: {
      owner_doctor_name: clinicData.owner_doctor_name,
      gmail: clinicData.gmail,
      password: clinicData.password,
      phone: clinicData.phone,
      speciality: clinicData.speciality,
      medical_council_reg_no: clinicData.medical_council_reg_no,
      experience: parseInt(clinicData.experience, 10),
      qualification: clinicData.qualification,
      clinic_name: clinicData.clinic_name,
      address: clinicData.address,
      city: clinicData.city,
      consultations_fee: clinicData.consultations_fee ? parseFloat(clinicData.consultations_fee) : 0.0,
      about_of_clinic: clinicData.about_of_clinic || null,
      status: clinicData.status || "pending",
      current_active_status: clinicData.current_active_status || "active",
    },
  });
};

export const fetchClinics = async () => {
  return await prisma.clinic.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
};

export const modifyClinic = async (id, updateData) => {
  // Ensure the clinic exists first
  const existing = await prisma.clinic.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Clinic not found.");
  }

  // If experience or consultations_fee are updated, parse them properly
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.experience !== undefined) {
    dataToUpdate.experience = parseInt(dataToUpdate.experience, 10);
  }
  if (dataToUpdate.consultations_fee !== undefined) {
    dataToUpdate.consultations_fee = parseFloat(dataToUpdate.consultations_fee);
  }

  return await prisma.clinic.update({
    where: { id },
    data: dataToUpdate,
  });
};

export const removeClinic = async (id) => {
  const existing = await prisma.clinic.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Clinic not found.");
  }

  return await prisma.clinic.delete({
    where: { id },
  });
};

export const findClinicByGmail = async (gmail) => {
  return await prisma.clinic.findUnique({
    where: { gmail },
  });
};

export const findClinicByPhone = async (phone) => {
  return await prisma.clinic.findUnique({
    where: { phone },
  });
};

export const findClinicByMedicalRegNo = async (medical_council_reg_no) => {
  return await prisma.clinic.findUnique({
    where: { medical_council_reg_no },
  });
};

export const findPendingByGmail = async (gmail) => {
  const pending = await prisma.emailVerification.findUnique({
    where: { gmail },
  });
  if (!pending) return null;
  return {
    ...pending,
    suspended_until: pending.locked_until,
    last_otp_sent_at: pending.last_sent_at,
    is_verified: pending.verified,
  };
};

export const upsertPendingRegistration = async (gmail, otpHash, otpExpiresAt) => {
  return await prisma.emailVerification.upsert({
    where: { gmail },
    update: {
      otp_hash: otpHash,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0,
      last_sent_at: new Date(),
      verified: false,
      locked_until: null,
    },
    create: {
      gmail,
      otp_hash: otpHash,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0,
      last_sent_at: new Date(),
      verified: false,
    },
  });
};

export const incrementOtpAttempts = async (gmail) => {
  return await prisma.emailVerification.update({
    where: { gmail },
    data: {
      otp_attempts: {
        increment: 1,
      },
    },
  });
};

export const suspendEmail = async (gmail, suspendedUntil) => {
  return await prisma.emailVerification.update({
    where: { gmail },
    data: {
      locked_until: suspendedUntil,
      otp_attempts: 0,
    },
  });
};

export const markEmailAsVerified = async (gmail) => {
  return await prisma.emailVerification.update({
    where: { gmail },
    data: {
      verified: true,
      otp_attempts: 0,
      locked_until: null,
    },
  });
};

export const deletePendingRegistration = async (gmail) => {
  return await prisma.emailVerification.delete({
    where: { gmail },
  });
};

export const registerVerifiedClinic = async (clinicData) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create Clinic record
    const clinic = await tx.clinic.create({
      data: {
        owner_doctor_name: clinicData.owner_doctor_name,
        gmail: clinicData.gmail,
        password: clinicData.password,
        phone: clinicData.phone,
        speciality: clinicData.speciality,
        medical_council_reg_no: clinicData.medical_council_reg_no,
        experience: parseInt(clinicData.experience, 10),
        qualification: clinicData.qualification,
        clinic_name: clinicData.clinic_name,
        address: clinicData.address,
        city: clinicData.city,
        consultations_fee: clinicData.consultations_fee ? parseFloat(clinicData.consultations_fee) : 0.0,
        about_of_clinic: clinicData.about_of_clinic || null,
        status: "pending",
        current_active_status: "active",
      },
    });

    // 2. Delete pending registration verification record
    await tx.emailVerification.delete({
      where: { gmail: clinicData.gmail },
    });

    return clinic;
  });
};


