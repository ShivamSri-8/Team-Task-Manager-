const User = require('../models/User');
const Project = require('../models/Project');

// ── GET /api/users ────────────────────────────────────────────
const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// ── GET /api/users/:id ────────────────────────────────────────
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// ── PUT /api/users/:id ────────────────────────────────────────
const updateUser = async (req, res) => {
  const { name, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name) user.name = name;
  if (role) user.role = role;

  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};

// ── DELETE /api/users/:id ─────────────────────────────────────
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete yourself' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Remove user from all projects
  await Project.updateMany(
    { members: user._id },
    { $pull: { members: user._id } }
  );

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
