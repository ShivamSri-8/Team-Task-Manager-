const Joi = require('joi');

// ── Auth ──────────────────────────────────────────────────────
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Member').default('Member'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Project ───────────────────────────────────────────────────
const projectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  status: Joi.string().valid('Active', 'On Hold', 'Completed').optional(),
});

// ── Task ──────────────────────────────────────────────────────
const taskSchema = Joi.object({
  title: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(1000).allow('').optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  assignedTo: Joi.string().optional().allow(null, ''),
  project: Joi.string().required(),
  dueDate: Joi.date().optional().allow(null),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(150).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  assignedTo: Joi.string().optional().allow(null, ''),
  dueDate: Joi.date().optional().allow(null),
});

// ── User ──────────────────────────────────────────────────────
const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  role: Joi.string().valid('Admin', 'Member').optional(),
});

// ── Validate helper ───────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(422).json({ message: messages });
  }
  next();
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  projectSchema,
  taskSchema,
  taskUpdateSchema,
  userUpdateSchema,
};
