/**
 * Role-based access control middleware factory.
 * Usage: authorizeRoles('Admin') or authorizeRoles('Admin', 'Member')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
