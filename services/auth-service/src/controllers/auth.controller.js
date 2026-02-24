import {
  loginService,
  registerService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService
} from "../services/auth.service.js";

/* ================= REFRESH TOKEN ================= */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const result = await refreshTokenService(token);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: result.accessToken,
    });
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // ✅ Validate bắt buộc
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // ❌ Không cho client tự set role
    const role = "user";

    const result = await registerService(
      name,
      email,
      password,
      role,
      phone
    );

    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }

    const result = await loginService(identifier, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({ message: "No refresh token found" });
    }

    await logoutService(token);

    res.clearCookie("refreshToken");

    return res.json({ message: "Logout successful" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await forgotPasswordService(email);

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    const result = await resetPasswordService(email, otp, newPassword);

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};