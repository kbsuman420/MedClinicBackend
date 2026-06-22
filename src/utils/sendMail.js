import { MailtrapTransport } from "mailtrap"


const TOKEN = process.env.NODEMAILER_TOKEN

console.log("NODE MAiler TOKEN:", process.env.NODEMAILER_TOKEN);

const sender = {
    address: "hello@demomailtrap.co",
    name: "LIBRARY MANAGEMENT SYSTEM",
};

console.log(process.env.NODEMAILER_TOKEN)



async function VerificationMail(email, verificationOtp) {
    const verificationLink =
        `${process.env.CORS_ORIGIN}/verify-email?token=${verificationOtp}`;

    try {
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
                subject: "Verify your email account",
                html: `
                        <h2>Email Verification</h2>

                        <p>
                            Your Verification code is ${verificationOtp}
                        </p>
        `
            })
        });
        const result = await response.json();

        console.log("Status:", response.status);


        if (!response.ok) {
            throw new Error(JSON.stringify(result));
        }
        console.log("Verification email sent successfully");
        return true;
    } catch (error) {
        console.error("Error sending verification email", error);
        return false;
    }
}

export { VerificationMail }