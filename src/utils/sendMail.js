import nodemailer from "nodemailer";
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);

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


async function VerificationMail(gmail, otp) {
    const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "MedClinic Verification"}" <${process.env.SMTP_USER}>`,
    to: gmail,
    subject: "Verify your email account",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4A90E2; text-align: center; margin-bottom: 20px;">Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address:</p>
            <div style="font-size: 26px; font-weight: bold; text-align: center; margin: 30px 0; padding: 15px; background-color: #f9f9f9; border: 1px dashed #dcdcdc; border-radius: 5px; letter-spacing: 5px; color: #333;">
            ${otp}
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
