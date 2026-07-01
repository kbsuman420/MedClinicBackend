import { Router } from "express";
import {
  createClinic,
  getAllClinic,
  updateClinic,
  deleteClinic,
  loginClinic,
  sendClinicOtp,
  verifyClinicOtp,
  resendClinicOtp,
  registerClinic,
} from "./clinic.controller.js";

const clinicRouter = Router();

// Send OTP flow (Initial step: requests email and sends verification OTP)
clinicRouter.route("/send-otp").post(sendClinicOtp);

// Verify OTP flow (Verifies OTP and marks email as verified)
clinicRouter.route("/verify-otp").post(verifyClinicOtp);

// Resend OTP flow (Resends OTP after 60s cooldown)
clinicRouter.route("/resend-otp").post(resendClinicOtp);

// Final registration flow (Submits all registration details after email is verified)
clinicRouter.route("/register").post(registerClinic);

// Create clinic (legacy direct route)
clinicRouter.route("/create-clinic").post(createClinic);

// Get all clinics
clinicRouter.route("/all-clinic").get(getAllClinic);

// Update clinic
clinicRouter.route("/update-clinic/:id").patch(updateClinic);

// Delete clinic
clinicRouter.route("/delete-clinic/:id").delete(deleteClinic);

// Login clinic
clinicRouter.route("/login").post(loginClinic);

export default clinicRouter;