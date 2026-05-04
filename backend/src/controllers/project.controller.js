const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// ── GET /api/projects ─────────────────────────────────────────
// Admin → all projects they own. Member → projects they're members of.
const getProjects = async (req, res) => {
  let projects;
  if (req.user.role === 'Admin') {
    projects = await Project.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .populate('members', 'name email role');
  } else {
    projects = await Project.find({ members: req.user._id })
      .populate('owner', 'name email')
      .populate('members', 'name email role');
  }
  res.json(projects);
};

// ── POST /api/projects ────────────────────────────────────────
const createProject = async (req, res) => {
  const { name, description, status } = req.body;

  const project = await Project.create({
    name,
    description,
    status,
    owner: req.user._id,
    members: [req.user._id], // creator is also a member
  });

  // Add project ref to owner's profile
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { projects: project._id },
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);

  res.status(201).json(populated);
};

// ── GET /api/projects/:id ─────────────────────────────────────
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email role');

  if (!project) return res.status(404).json({ message: 'Project not found' });

  // Access check
  const isMember = project.members.some(
    (m) => m._id.toString() === req.user._id.toString()
  );
  const isOwner = project.owner._id.toString() === req.user._id.toString();

  if (!isMember && !isOwner && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(project);
};

// ── PUT /api/projects/:id ─────────────────────────────────────
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can update it' });
  }

  const { name, description, status } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;

  await project.save();
  await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);
  res.json(project);
};

// ── DELETE /api/projects/:id ──────────────────────────────────
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can delete it' });
  }

  // Cascade delete tasks
  await Task.deleteMany({ project: project._id });

  // Remove project from all members' profiles
  await User.updateMany(
    { _id: { $in: project.members } },
    { $pull: { projects: project._id } }
  );

  await project.deleteOne();
  res.json({ message: 'Project deleted successfully' });
};

// ── POST /api/projects/:id/members ───────────────────────────
const addMember = async (req, res) => {
  const { userId } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can add members' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (project.members.includes(userId)) {
    return res.status(409).json({ message: 'User is already a member' });
  }

  project.members.push(userId);
  await project.save();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { projects: project._id },
  });

  await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);
  res.json(project);
};

// ── DELETE /api/projects/:id/members/:userId ──────────────────
const removeMember = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can remove members' });
  }

  if (req.params.userId === req.user._id.toString()) {
    return res.status(400).json({ message: 'Owner cannot remove themselves' });
  }

  project.members = project.members.filter(
    (m) => m.toString() !== req.params.userId
  );
  await project.save();

  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { projects: project._id },
  });

  await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);
  res.json(project);
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
