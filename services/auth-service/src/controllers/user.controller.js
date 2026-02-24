import pool from "../config/db.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT id, name, email, phone, role FROM public.users WHERE id = $1",
      [userId]
    );

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};