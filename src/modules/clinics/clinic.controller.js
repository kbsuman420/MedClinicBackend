import * as clinicService from "./clinic.service.js";

export const createClinic = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, error: "Name and address are required." });
    }

    const clinic = await clinicService.createNewClinic({ name, address, phone, email });
    return res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllClinic = async (req, res) => {
  try {
    const clinics = await clinicService.fetchClinics();
    return res.status(200).json({ success: true, data: clinics });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const clinic = await clinicService.modifyClinic(id, updateData);
    return res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;
    await clinicService.removeClinic(id);
    return res.status(200).json({ success: true, message: "Clinic deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
