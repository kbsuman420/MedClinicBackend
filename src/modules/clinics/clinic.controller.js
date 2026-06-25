import bcrypt from "bcryptjs";
import * as clinicService from "./clinic.service.js";

export const createClinic = async (req, res) => {
  try {
    const {
      owner_doctor_name,
      gmail,
      password,
      phone,
      speciality,
      medical_council_reg_no,
      experience,
      qualification,
      clinic_name,
      address,
      city,
      consultations_fee,
      about_of_clinic
    } = req.body;

    // 1. Check for missing required fields
    if (!owner_doctor_name) return res.status(400).json({ success: false, error: "Owner doctor name is required." });
    if (!gmail) return res.status(400).json({ success: false, error: "Gmail is required." });
    if (!password) return res.status(400).json({ success: false, error: "Password is required." });
    if (!phone) return res.status(400).json({ success: false, error: "Phone number is required." });
    if (!speciality) return res.status(400).json({ success: false, error: "Speciality is required." });
    if (!medical_council_reg_no) return res.status(400).json({ success: false, error: "Medical council registration number is required." });
    if (experience === undefined || experience === null || experience === "") {
      return res.status(400).json({ success: false, error: "Experience is required." });
    }
    if (!qualification) return res.status(400).json({ success: false, error: "Qualification is required." });
    if (!clinic_name) return res.status(400).json({ success: false, error: "Clinic name is required." });
    if (!address) return res.status(400).json({ success: false, error: "Address is required." });
    if (!city) return res.status(400).json({ success: false, error: "City is required." });

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmail)) {
      return res.status(400).json({ success: false, error: "Invalid Gmail address format." });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }

    // 4. Validate experience is a valid integer >= 0
    const parsedExperience = parseInt(experience, 10);
    if (isNaN(parsedExperience) || parsedExperience < 0) {
      return res.status(400).json({ success: false, error: "Experience must be a non-negative integer." });
    }

    // 5. Check if Gmail already exists
    const existingGmail = await clinicService.findClinicByGmail(gmail);
    if (existingGmail) {
      return res.status(400).json({ success: false, error: "Gmail is already registered." });
    }

    // 6. Check if Phone already exists
    const existingPhone = await clinicService.findClinicByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ success: false, error: "Phone number is already registered." });
    }

    // 7. Check if Medical Council Reg No already exists
    const existingRegNo = await clinicService.findClinicByMedicalRegNo(medical_council_reg_no);
    if (existingRegNo) {
      return res.status(400).json({ success: false, error: "Medical Council Registration Number is already registered." });
    }

    // 8. Encrypt/Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 9. Save to Database
    const clinic = await clinicService.createNewClinic({
      owner_doctor_name,
      gmail,
      password: hashedPassword,
      phone,
      speciality,
      medical_council_reg_no,
      experience: parsedExperience,
      qualification,
      clinic_name,
      address,
      city,
      consultations_fee: consultations_fee ? parseFloat(consultations_fee) : 0,
      about_of_clinic
    });

    // Remove password field before returning the response
    const { password: _, ...clinicWithoutPassword } = clinic;

    return res.status(201).json({ success: true, data: clinicWithoutPassword });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllClinic = async (req, res) => {
  try {
    const clinics = await clinicService.fetchClinics();
    const clinicsWithoutPasswords = clinics.map(({ password, ...rest }) => rest);
    return res.status(200).json({ success: true, data: clinicsWithoutPasswords });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const clinic = await clinicService.modifyClinic(id, updateData);
    const { password: _, ...clinicWithoutPassword } = clinic;

    return res.status(200).json({ success: true, data: clinicWithoutPassword });
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

export const loginClinic = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    if (!gmail || !password) {
      return res.status(400).json({ success: false, error: "Gmail and password are required." });
    }

    // 1. Find clinic by email
    const clinic = await clinicService.findClinicByGmail(gmail);
    if (!clinic) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, clinic.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    // 3. Remove password and return clinic data
    const { password: _, ...clinicWithoutPassword } = clinic;
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: clinicWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
