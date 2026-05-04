const Task = require('../models/Task');
const Project = require('../models/Project');

// ── GET /api/tasks ────────────────────────────────────────────
// Admin → all tasks in their projects. Member → only assigned tasks.
const getTasks = async (req, res) => {
  let tasks;

  if (req.user.role === 'Admin') {
    // Get all tasks from projects the admin owns
    const adminProjects = await Project.find({ owner: req.user._id }).select('_id');
    const projectIds = adminProjects.map((p) => p._id);
    tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
  } else {
    tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
  }

  res.json(tasks);
};

// ── GET /api/tasks/project/:projectId ────────────────────────
const getTasksByProject = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignedTo', 'name email')
    .populate('project', 'name');

  res.json(tasks);
};

// ── GET /api/tasks/dashboard ──────────────────────────────────
const getDashboardStats = async (req, res) => {
  const now = new Date();
  let query = {};

  if (req.user.role === 'Admin') {
    const adminProjects = await Project.find({ owner: req.user._id }).select('_id');
    query.project = { $in: adminProjects.map((p) => p._id) };
  } else {
    query.assignedTo = req.user._id;
  }

  const [total, completed, inProgress, overdue] = await Promise.all([
    Task.countDocuments(query),
    Task.countDocuments({ ...query, status: 'Done' }),
    Task.countDocuments({ ...query, status: 'In Progress' }),
    Task.countDocuments({
      ...query,
      status: { $ne: 'Done' },
      dueDate: { $lt: now },
    }),
  ]);

  const pending = total - completed;

  res.json({ total, completed, inProgress, pending, overdue });
};

// ── POST /api/tasks ───────────────────────────────────────────
const createTask = async (req, res) => {
  const { title, description, status, priority, assignedTo, project, dueDate } = req.body;

  // Verify project exists and requester is its owner
  const proj = await Project.findById(project);
  if (!proj) return res.status(404).json({ message: 'Project not found' });

  if (proj.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can create tasks' });
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    assignedTo: assignedTo || null,
    project,
    dueDate: dueDate || null,
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'project', select: 'name' },
  ]);

  res.status(201).json(populated);
};

// ── GET /api/tasks/:id ────────────────────────────────────────
const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('project', 'name owner');

  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

// ── PUT /api/tasks/:id ────────────────────────────────────────
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const isOwner =
    task.project.owner.toString() === req.user._id.toString();
  const isAssignee =
    task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  // Members can only update status of their own tasks
  if (req.user.role === 'Member') {
    if (!isAssignee) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }
    // Members can only change status
    if (req.body.status) task.status = req.body.status;
  } else {
    // Admin: update any allowed field
    const fields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f] || null;
    });
    if (req.body.title) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.priority) task.priority = req.body.priority;
  }

  await task.save();
  await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'project', select: 'name' },
  ]);
  res.json(task);
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (task.project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can delete tasks' });
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted successfully' });
};

module.exports = {
  getTasks,
  getTasksByProject,
  getDashboardStats,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
