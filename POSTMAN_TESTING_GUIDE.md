# Postman Testing Guide - Clinic OTP Verification

This guide outlines how to test the temporary registration, OTP verification, and resending flows using **Postman** (or any API client like Thunder Client).

---

## 1. Environment Configuration

* **Server URL:** `http://localhost:3000` (or your configured `PORT`)
* **Headers for all requests:**
  * `Content-Type: application/json`

---

## 2. API Reference & Test Steps

### Step 1: Initiate Clinic Registration (Pending Flow)
This endpoint validates the clinic details, checks for duplicate credentials, hashes the password, generates a 6-digit OTP, hashes it, stores a temporary registration record, and sends an email.

* **Method:** `POST`
* **Route:** `/api/clinic/register`
* **Body (JSON):**
```json
{
  "owner_doctor_name": "Dr. Jane Doe",
  "gmail": "jane.doe@example.com",
  "password": "securePassword123",
  "phone": "+19876543210",
  "speciality": "Pediatrics",
  "medical_council_reg_no": "MC-54321",
  "experience": 12,
  "qualification": "MBBS, MD (Pediatrics)",
  "clinic_name": "Sunshine Kids Clinic",
  "address": "456 Wellness Way",
  "city": "New York",
  "consultations_fee": 150.00,
  "about_of_clinic": "Dedicated pediatric healthcare and wellness consultations."
}
```

* **Expected Response (Success):**
```json
{
  "success": true,
  "message": "Clinic registration details submitted successfully. Verification OTP has been sent to your Gmail address."
}
```

* **Possible Validation Errors:**
  * **Email already registered:** `{"success": false, "error": "Email already registered."}`
  * **Duplicate phone or medical council number:** `{"success": false, "error": "Phone number is already registered to a clinic."}`
  * **Missing fields:** `{"success": false, "error": "Password is required."}`

---

### Step 2: Retrieve the OTP
Because this is a production-level flow, **the OTP is hashed using bcrypt before it is stored in the database**. You cannot retrieve it directly from database columns.

* **For Testing (Production Setup):** Log into the Mailtrap account configured in your `.env` under `NODEMAILER_TOKEN`. Check the inbox for the email titled **"Verify Your Clinic Email - OTP Verification"** to copy the 6-digit OTP.
* **For Local Debugging:** If you want to print the OTP directly to the terminal, you can add `console.log("OTP Code:", otp);` before line 125 in [clinic.controller.js](file:///C:/react%20js%20Udemy%20course/medical-website-sinchan/Backend/src/modules/clinics/clinic.controller.js).

---

### Step 3: Verify the OTP
Submits the OTP code. If correct, the server performs a database transaction to create the active `Clinic` record, sets `status` to `pending`, and purges the temporary pending registration.

* **Method:** `POST`
* **Route:** `/api/clinic/verify-otp`
* **Body (JSON):**
```json
{
  "gmail": "jane.doe@example.com",
  "otp": "123456"
}
```

* **Expected Response (Success):**
```json
{
  "success": true,
  "message": "Email verification successful. Clinic registered successfully.",
  "data": {
    "id": "d8a12bc4-8390-4c3e-908a-23b9d0319efc",
    "owner_doctor_name": "Dr. Jane Doe",
    "gmail": "jane.doe@example.com",
    "phone": "+19876543210",
    "speciality": "Pediatrics",
    "medical_council_reg_no": "MC-54321",
    "experience": 12,
    "qualification": "MBBS, MD (Pediatrics)",
    "clinic_name": "Sunshine Kids Clinic",
    "address": "456 Wellness Way",
    "city": "New York",
    "consultations_fee": 150,
    "about_of_clinic": "Dedicated pediatric healthcare and wellness consultations.",
    "status": "pending",
    "current_active_status": "active",
    "created_at": "2026-06-26T05:22:15.123Z",
    "updated_at": "2026-06-26T05:22:15.123Z"
  }
}
```

* **Possible Validation Errors:**
  * **Invalid OTP:** `{"success": false, "error": "Invalid OTP. Verification failed. Attempts remaining: 4"}`
  * **OTP Expired:** `{"success": false, "error": "OTP has expired. Please request a new one."}`
  * **Attempts Exceeded:** `{"success": false, "error": "Maximum OTP verification attempts exceeded. Please register again to generate a new OTP."}`

---

### Step 4 (Optional): Resend the OTP
If the OTP expires or goes missing, request a new OTP. A 60-second cooldown is enforced to prevent spamming.

* **Method:** `POST`
* **Route:** `/api/clinic/resend-otp`
* **Body (JSON):**
```json
{
  "gmail": "jane.doe@example.com"
}
```

* **Expected Response (Success):**
```json
{
  "success": true,
  "message": "A new verification OTP has been sent to your Gmail address."
}
```

* **Expected Response (Rate Limit Cooldown):**
```json
{
  "success": false,
  "error": "Please wait 45 seconds before requesting another OTP."
}
```

---

## 3. Database State Flow Check

To verify the records in your PostgreSQL database at each step:
1. Run `npx prisma studio` in your terminal.
2. **After Step 1:** Go to the `PendingClinicRegistration` table. You should see a record containing your hashed password and hashed OTP. The `Clinic` table should remain empty.
3. **After Step 3 (Success):** The `PendingClinicRegistration` table should now be empty (the record has been deleted). Check the `Clinic` table; a new record with your clinic details should be created with `status` set to `pending`.
