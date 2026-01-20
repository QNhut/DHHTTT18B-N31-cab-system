const prisma = require("../../prisma.config");
// đường dẫn đúng đến prisma.config.ts

// Lấy danh sách tất cả users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy user theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo user mới
const createUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await prisma.user.create({
      data: { name, email, phone, role },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, role },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
