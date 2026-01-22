const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Lưu user info từ token (ví dụ: user_id, role)
    if (req.user.role !== 'driver') return res.status(403).json({ error: 'Access denied' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};