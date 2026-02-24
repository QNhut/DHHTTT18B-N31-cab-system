import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

/* ================= ACCESS TOKEN ================= */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

/* ================= REFRESH TOKEN ================= */
export const generateRefreshToken = (payload) => {
  const jti = randomUUID();

  const token = jwt.sign(
    { ...payload, jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { token, jti };
};

/* ================= VERIFY ================= */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};