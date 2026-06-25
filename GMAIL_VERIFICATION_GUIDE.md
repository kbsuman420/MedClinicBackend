# Gmail Email Verification Configuration Guide

This guide details how to set up a free Gmail verification service in your Node.js backend using **Nodemailer** for testing purposes.

---

## Step 1: Install Nodemailer

Nodemailer is the industry-standard package for sending emails in Node.js. To install it, run the following command in your terminal:

```bash
npm install nodemailer
```

---

## Step 2: Configure Your Google Account

Since Google disabled "Less Secure Apps" access, you must generate a secure **App Password** to send emails using SMTP.

1. Go to your [Google Account Console](https://myaccount.google.com/).
2. Navigate to the **Security** tab in the left-hand menu.
3. Under the **"Signing in to Google"** section, ensure that **2-Step Verification** is enabled. (This is required to generate App Passwords).
4. Click on **2-Step Verification**, scroll to the bottom of the page, and select **App Passwords**.
5. Give your app a name (e.g., `MedClinic Backend`) and click **Create**.
6. Google will generate a **16-character password** (e.g., `xxxx xxxx xxxx xxxx`). **Copy this password immediately**—you will not be able to view it again.

---

## Step 3: Update Environment Variables (`.env`)

Add the following SMTP configuration variables to your `.env` file at the root of your project:

```env
# SMTP Mail Settings (Gmail Config)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME="MedClinic Verification"
```

---

## Step 4: Update the Email Service Code

Replace the contents of [src/utils/sendMail.js](file:///C:/react%20js%20Udemy%20course/medical-website-sinchan/Backend/src/utils/sendMail.js) with the following production-grade Nodemailer SMTP implementation:

```javascript
import nodemailer from "nodemailer";

// Create a reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_PORT === "465", // true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a verification OTP email to a user.
 * @param {string} email - Recipient email address
 * @param {string|number} verificationOtp - One-time password code
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
async function VerificationMail(email, verificationOtp) {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "MedClinic Verification"}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your email account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4A90E2; text-align: center; margin-bottom: 20px;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="font-size: 26px; font-weight: bold; text-align: center; margin: 30px 0; padding: 15px; background-color: #f9f9f9; border: 1px dashed #dcdcdc; border-radius: 5px; letter-spacing: 5px; color: #333;">
          ${verificationOtp}
        </div>
        <p>This code is valid for a limited time. If you did not request this verification, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 25px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("🟢 Verification email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("🔴 Error sending verification email:", error);
    return false;
  }
}

export { VerificationMail };
```
