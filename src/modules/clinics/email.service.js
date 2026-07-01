/**
 * Email OTP Service for Clinic Management System
 */

const TOKEN = process.env.NODEMAILER_TOKEN;
const sender = {
  address: "hello@demomailtrap.co",
  name: "MedClinic Management System",
};

/**
 * Generates a 6-digit numeric OTP.
 * @returns {string}
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends the OTP to the clinic's gmail address.
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<boolean>}
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    // Node.js v18+ supports global fetch
    const response = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [
          {
            email: email
          }
        ],
        from: {
          name: sender.name,
          email: sender.address
        },
        subject: "Verify Your Clinic Email - OTP Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
            <h2 style="color: #3f51b5; text-align: center;">MedClinic Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering your clinic with MedClinic. Please use the following One-Time Password (OTP) to complete your verification. This OTP is valid for 5 minutes.</p>
            <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; padding: 15px; border-radius: 5px; background-color: #e8eaf6; letter-spacing: 5px; color: #3f51b5;">
              ${otp}
            </div>
            <p>If you did not initiate this request, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #9e9e9e; text-align: center;">&copy; ${new Date().getFullYear()} MedClinic. All rights reserved.</p>
          </div>
        `
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }
    console.log(`Verification OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};
