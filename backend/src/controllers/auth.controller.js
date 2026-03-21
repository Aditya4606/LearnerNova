import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import { sendOtpEmail } from "../utils/email.util.js";


// 🔹 SIGNUP
export const signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be 8+ chars, include uppercase, lowercase, number, special char",
  });
}

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashed,
      },
    });

    const token = generateToken(user);

    // ✅ store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // development
      sameSite: "lax",
    });

    res.json({
      message: "Signup successful",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    // ✅ store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // development
      sameSite: "lax",
    });

    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

// 🔹 REQUEST OTP
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    // Delete any existing OTPs for this email
    await prisma.passwordOtp.deleteMany({ where: { email } });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.passwordOtp.create({
      data: { email, otp: hashedOtp, expiresAt },
    });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("requestOtp error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = await prisma.passwordOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!record) return res.status(400).json({ message: "OTP not found. Please request a new one." });

    if (new Date() > record.expiresAt) {
      await prisma.passwordOtp.deleteMany({ where: { email } });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified", verified: true });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP, and new password are required" });

    const record = await prisma.passwordOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!record) return res.status(400).json({ message: "OTP not found. Please request a new one." });

    if (new Date() > record.expiresAt) {
      await prisma.passwordOtp.deleteMany({ where: { email } });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8+ chars, include uppercase, lowercase, number, special char",
      });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    await prisma.passwordOtp.deleteMany({ where: { email } });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ error: err.message });
  }
};