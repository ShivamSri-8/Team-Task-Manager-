const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate, userUpdateSchema } = require('../validation/schemas');

router.use(protect);

router.get('/', authorizeRoles('Admin'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', authorizeRoles('Admin'), validate(userUpdateSchema), updateUser);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);

module.exports = router;
