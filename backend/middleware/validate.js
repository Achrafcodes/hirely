module.exports = function validate(rules) {
  return (req, res, next) => {
    for (const [field, { max, label }] of Object.entries(rules)) {
      const val = req.body[field];
      if (typeof val === 'string' && val.length > max) {
        return res.status(400).json({
          message: `${label || field} must be ${max} characters or fewer`,
        });
      }
    }
    next();
  };
};
