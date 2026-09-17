// Middleware helper to handle validation result errors
exports.validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const error = validation(req);
      if (error) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: ${error}`
        });
      }
    }
    next();
  };
};

// Common validation primitives
exports.cleanPhone = (val) => {
  if (!val) return '';
  return String(val).replace(/\D/g, '').slice(-10);
};

exports.isMobile = (val) => {
  const cleaned = exports.cleanPhone(val);
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
};

exports.isEmpty = (val) => {
  return !val || (typeof val === 'string' && val.trim().length === 0);
};

exports.isPositiveNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && num > 0;
};

exports.isNonNegativeNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};
