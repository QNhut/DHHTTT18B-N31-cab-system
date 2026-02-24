import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { redisClient } from "../config/redis.js";
import { ROLES } from "../constants/role.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";
import { validateRegisterInput } from "../utils/validator.util.js";
import { generateOTP } from "../utils/otp.util.js";
import { sendEmail } from "../utils/email.util.js";

/* ================= REGISTER ================= */
export const registerService = async (
  name,
  email,
  password,
  role = ROLES.USER,
  phone
) => {
  if (!name || !email || !password || !phone) {
    throw new Error("All fields are required");
  }

  email = email.toLowerCase();

  validateRegisterInput({ name, email, password, phone });

  // 🔒 Luôn chuẩn hóa role
  role = role.toUpperCase();

  if (!Object.values(ROLES).includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await pool.query(
    "SELECT id FROM public.users WHERE email = $1 OR phone = $2",
    [email, phone]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email or phone already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO public.users (name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role`,
    [name, email, phone, hashedPassword, role]
  );

  return {
    message: "Register successful",
    user: result.rows[0],
  };
};

/* ================= LOGIN ================= */
export const loginService = async (identifier, password) => {
  if (!identifier || !password) {
    throw new Error("Identifier and password are required");
  }

  const isEmail = identifier.includes("@");

  const result = await pool.query(
    isEmail
      ? "SELECT * FROM public.users WHERE email = $1"
      : "SELECT * FROM public.users WHERE phone = $1",
    [isEmail ? identifier.toLowerCase() : identifier]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const { token: refreshToken, jti } =
    generateRefreshToken({ userId: user.id });

  await redisClient.set(
    `refresh:${user.id}:${jti}`,
    refreshToken,
    { EX: 7 * 24 * 60 * 60 }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

/* ================= REFRESH TOKEN ================= */
export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token");

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const key = `refresh:${decoded.userId}:${decoded.jti}`;

  const storedToken = await redisClient.get(key);

  if (!storedToken || storedToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
    role: decoded.role,
  });

  return {
    accessToken: newAccessToken,
    refreshToken,
  };
};

/* ================= LOGOUT ================= */
export const logoutService = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token");

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const key = `refresh:${decoded.userId}:${decoded.jti}`;

  await redisClient.del(key);

  return true;
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPasswordService = async (email) => {
  email = email.toLowerCase();

  const result = await pool.query(
    "SELECT id FROM public.users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Email not found");
  }

  const otp = generateOTP();

  await redisClient.set(
    `otp:${email}`,
    otp,
    { EX: 300 } // 5 phút
  );

  await sendEmail(email, "Reset Password OTP", `Your OTP: ${otp}`);

  return { message: "OTP sent to email" };
};

/* ================= RESET PASSWORD ================= */
export const resetPasswordService = async (
  email,
  otp,
  newPassword
) => {
  email = email.toLowerCase();

  const storedOTP = await redisClient.get(`otp:${email}`);

  if (!storedOTP || storedOTP !== otp) {
    throw new Error("Invalid OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE public.users SET password = $1 WHERE email = $2",
    [hashedPassword, email]
  );

  await redisClient.del(`otp:${email}`);

  return { message: "Password reset successful" };
};