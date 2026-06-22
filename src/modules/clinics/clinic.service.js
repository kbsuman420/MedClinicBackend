import { prisma } from "../../database/index.js";

export const createNewClinic = async (clinicData) => {
  return await prisma.clinic.create({
    data: {
      name: clinicData.name,
      address: clinicData.address,
      phone: clinicData.phone,
      email: clinicData.email,
    },
  });
};

export const fetchClinics = async () => {
  return await prisma.clinic.findMany({
    include: {
      doctors: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialty: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const modifyClinic = async (id, updateData) => {
  // Ensure the clinic exists first
  const existing = await prisma.clinic.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Clinic not found.");
  }

  return await prisma.clinic.update({
    where: { id },
    data: updateData,
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
