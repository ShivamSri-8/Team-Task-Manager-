const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate, projectSchema } = require('../validation/schemas');

router.use(protect); // All project routes require auth

router.get('/', getProjects);
router.post('/', authorizeRoles('Admin'), validate(projectSchema), createProject);
router.get('/:id', getProjectById);
router.put('/:id', authorizeRoles('Admin'), validate(projectSchema), updateProject);
router.delete('/:id', authorizeRoles('Admin'), deleteProject);
router.post('/:id/members', authorizeRoles('Admin'), addMember);
router.delete('/:id/members/:userId', authorizeRoles('Admin'), removeMember);

module.exports = router;
