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
      is_verified: clinicData.is_verified || false,
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
