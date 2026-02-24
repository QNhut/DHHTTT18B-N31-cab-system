import { verifyToken } from "../utils/jwt.util.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Token invalid or expired",
    });
  }
};

export default authMiddleware;