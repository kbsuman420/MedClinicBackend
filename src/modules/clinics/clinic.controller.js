import bcrypt from "bcryptjs";
import * as clinicService from "./clinic.service.js";
import { VerificationMail } from "../../utils/sendMail.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

// Max OTP attempts allowed before suspension
const MAX_OTP_ATTEMPTS = 5;
const SUSPENSION_TIME_MS = 15 * 60 * 1000; // 15 minutes

/**
 * 1. Send OTP API (Initial step: requests email and sends verification OTP)
 */
export const sendClinicOtp = async (req, res) => {
  try {
    const { gmail } = req.body;

    if (!gmail) {
      return res.status(400).json({ success: false, error: "Gmail is required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmail)) {
      return res.status(400).json({ success: false, error: "Invalid Gmail address format." });
    }

    // Check if Gmail is already registered in active Clinics
    const existingGmail = await clinicService.findClinicByGmail(gmail);
    if (existingGmail) {
      return res.status(400).json({ success: false, error: "Email is already registered." });
    }

    // Check if pending registration verification record exists
    const pending = await clinicService.findPendingByGmail(gmail);
    if (pending) {
      // Check for 15-minute suspension
      if (pending.suspended_until && new Date() < new Date(pending.suspended_until)) {
        const remainingMs = new Date(pending.suspended_until).getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / (60 * 1000));
        return res.status(403).json({
          success: false,
          error: `This email is temporarily suspended due to too many failed OTP attempts. Please try again in ${remainingMins} minutes.`
        });
      }

      // Rule: Allow resend/new OTP request after 60 seconds
      const timeDiffMs = Date.now() - new Date(pending.last_otp_sent_at).getTime();
      if (timeDiffMs < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeDiffMs) / 1000);
        return res.status(429).json({
          success: false,
          error: `Please wait ${waitSeconds} seconds before requesting another OTP.`
        });
      }
    }

    // Generate new OTP and hash it
    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Send verification email
    const isEmailSent = await VerificationMail(gmail, otp);
    if (!isEmailSent) {
      return res.status(500).json({ success: false, error: "Failed to send verification OTP email. Please try again." });
    }

    // Save/update verification details
    await clinicService.upsertPendingRegistration(gmail, otpHash, otpExpiresAt);

    return res.status(200).json({
      success: true,
      message: "Verification OTP has been sent to your Gmail address."
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. Verify OTP API (Checks OTP correctness and handles 15-minute suspension)
 */
export const verifyClinicOtp = async (req, res) => {
  try {
    const { gmail, otp } = req.body;

    if (!gmail || !otp) {
      return res.status(400).json({ success: false, error: "Gmail and OTP are required." });
    }

    // Find verification record
    const pending = await clinicService.findPendingByGmail(gmail);
    if (!pending) {
      return res.status(404).json({ success: false, error: "No pending registration verification found for this email." });
    }

    // Check for 15-minute suspension
    if (pending.suspended_until && new Date() < new Date(pending.suspended_until)) {
      const remainingMs = new Date(pending.suspended_until).getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / (60 * 1000));
      return res.status(403).json({
        success: false,
        error: `Verification is suspended for this email. Please try again in ${remainingMins} minutes.`
      });
    }

    // Check OTP expiry
    if (new Date() > new Date(pending.otp_expires_at)) {
      return res.status(400).json({ success: false, error: "OTP has expired. Please request a new one." });
    }

    // Compare hashed OTP
    const isOtpValid = await bcrypt.compare(otp, pending.otp_hash);
    if (!isOtpValid) {
      const currentAttempts = pending.otp_attempts + 1;

      if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        const suspendedUntil = new Date(Date.now() + SUSPENSION_TIME_MS);
        await clinicService.suspendEmail(gmail, suspendedUntil);
        return res.status(403).json({
          success: false,
          error: "Maximum OTP attempts exceeded. This email has been suspended for 15 minutes."
        });
      } else {
        await clinicService.incrementOtpAttempts(gmail);
        const remainingAttempts = MAX_OTP_ATTEMPTS - currentAttempts;
        return res.status(400).json({
          success: false,
          error: `Invalid OTP. Verification failed. Attempts remaining: ${remainingAttempts}`
        });
      }
    }

    // Mark email as verified
    await clinicService.markEmailAsVerified(gmail);

    return res.status(200).json({
      success: true,
      message: "Email verification successful. You can now complete your clinic registration."
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 3. Resend OTP API (Resends OTP after cooldown)
 */
export const resendClinicOtp = async (req, res) => {
  try {
    const { gmail } = req.body;

    if (!gmail) {
      return res.status(400).json({ success: false, error: "Gmail is required." });
    }

    const pending = await clinicService.findPendingByGmail(gmail);
    if (!pending) {
      return res.status(404).json({ success: false, error: "No pending verification found for this email address." });
    }

    // Check suspension
    if (pending.suspended_until && new Date() < new Date(pending.suspended_until)) {
      const remainingMs = new Date(pending.suspended_until).getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / (60 * 1000));
      return res.status(403).json({
        success: false,
        error: `Request is suspended. Please try again in ${remainingMins} minutes.`
      });
    }

    // Check 60-second cooldown
    const timeDiffMs = Date.now() - new Date(pending.last_otp_sent_at).getTime();
    if (timeDiffMs < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - timeDiffMs) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting another OTP.`
      });
    }

    // Generate new OTP and hash it
    const otp = generateOTP();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Send OTP email
    const isEmailSent = await VerificationMail(gmail, otp);
    if (!isEmailSent) {
      return res.status(500).json({ success: false, error: "Failed to send verification OTP email. Please try again." });
    }

    // Update pending OTP details
    await clinicService.upsertPendingRegistration(gmail, otpHash, otpExpiresAt);

    return res.status(200).json({
      success: true,
      message: "A new verification OTP has been sent to your Gmail address."
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 4. Clinic Registration API (Final registration step after email has been verified)
 */
export const registerClinic = async (req, res) => {
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

    // 1. Required fields validation
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

    // 5. Verify email has been verified
    const pending = await clinicService.findPendingByGmail(gmail);
    if (!pending || !pending.is_verified) {
      return res.status(400).json({ success: false, error: "Email verification is required before clinic registration." });
    }

    // 6. Verify verification session is not expired (e.g., must complete registration within 30 minutes of verification)
    const verifiedAt = new Date(pending.updated_at).getTime();
    if (Date.now() - verifiedAt > 30 * 60 * 1000) {
      return res.status(400).json({ success: false, error: "Verification session has expired. Please verify your email again." });
    }

    // 7. Check if Gmail already exists in active Clinics
    const existingGmail = await clinicService.findClinicByGmail(gmail);
    if (existingGmail) {
      return res.status(400).json({ success: false, error: "Email already registered." });
    }

    // 8. Prevent duplicate phone and medical_council_reg_no in Clinic
    const existingPhone = await clinicService.findClinicByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ success: false, error: "Phone number is already registered to a clinic." });
    }

    const existingRegNo = await clinicService.findClinicByMedicalRegNo(medical_council_reg_no);
    if (existingRegNo) {
      return res.status(400).json({ success: false, error: "Medical Council Registration Number is already registered to a clinic." });
    }

    // 9. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 10. Save to Clinic table and delete verification record in transaction
    const clinic = await clinicService.registerVerifiedClinic({
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

    const { password: _, ...clinicWithoutPassword } = clinic;

    return res.status(201).json({
      success: true,
      message: "Clinic registered successfully.",
      data: clinicWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

