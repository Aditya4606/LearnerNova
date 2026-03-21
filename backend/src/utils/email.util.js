import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASS,
  },
});

export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"LearnerNova" <${process.env.NODE_MAILER_EMAIL}>`,
    to,
    subject: 'Your LearnerNova Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F5F0EB; padding: 40px;">
        <div style="background: #141314; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="color: #FB460D; font-size: 13px; font-weight: bold; letter-spacing: 0.2em;">LEARNOVA</span>
        </div>
        <div style="background: #fff; padding: 40px; border: 1px solid #EAE4DD;">
          <h2 style="font-size: 22px; font-weight: 800; color: #141314; margin: 0 0 8px;">PASSWORD RESET</h2>
          <p style="color: #8A817C; font-size: 14px; margin: 0 0 32px;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background: #F5F0EB; border: 2px solid #FB460D; padding: 24px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #FB460D;">${otp}</span>
          </div>
          <p style="color: #8A817C; font-size: 12px; margin: 0;">If you didn't request this, safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
