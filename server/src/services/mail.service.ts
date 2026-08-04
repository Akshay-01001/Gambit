import nodemailer from "nodemailer";

export const getTransporter = () => nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS
    },
    secure: true,
    port: 465
});

export const sendOtpMail = async (email: string, otp: string) => {
    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email,
            text: `Yout Otp is : ${otp}`
        });
    } catch (error) {
        console.error(error);
        throw new Error("Failed to generate otp try again later")
    }
};
