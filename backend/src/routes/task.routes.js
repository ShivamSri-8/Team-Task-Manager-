const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTasksByProject,
  getDashboardStats,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate, taskSchema, taskUpdateSchema } = require('../validation/schemas');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/project/:projectId', getTasksByProject);
router.get('/', getTasks);
router.post('/', authorizeRoles('Admin'), validate(taskSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', validate(taskUpdateSchema), updateTask);
router.delete('/:id', authorizeRoles('Admin'), deleteTask);

module.exports = router;
