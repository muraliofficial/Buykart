const { cleanPhone } = require('../middleware/validator');

// Validation rules for Customer Website App
exports.validateSendOtp = (req) => {
  const cleanMobile = cleanPhone(req.body?.mobile);
  if (!cleanMobile || cleanMobile.length !== 10) {
    return 'A valid 10-digit mobile number is required.';
  }
  req.body.mobile = cleanMobile;
  return null;
};

exports.validateVerifyOtp = (req) => {
  const cleanMobile = cleanPhone(req.body?.mobile);
  if (!cleanMobile || cleanMobile.length !== 10) {
    return 'A valid 10-digit mobile number is required.';
  }
  req.body.mobile = cleanMobile;

  const { otp } = req.body;
  if (!otp || String(otp).trim().length !== 4) {
    return 'A 4-digit verification OTP code is required.';
  }
  return null;
};

exports.validateUpdateProfile = (req) => {
  const { name, mobile, email } = req.body;
  const cleanMobile = cleanPhone(mobile);
  if (!cleanMobile || cleanMobile.length !== 10) {
    return 'A valid 10-digit mobile number is required.';
  }
  req.body.mobile = cleanMobile;

  if (!name || String(name).trim().length < 2) {
    return 'Full name is required (minimum 2 characters).';
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return 'Please enter a valid email address format.';
  }
  return null;
};

exports.validateCheckout = (req) => {
  const { cart, shippingDetails, customerMobile, phone } = req.body;
  if (!cart || typeof cart !== 'object' || Object.keys(cart).length === 0) {
    return 'Your shopping cart is empty. Please add items to checkout.';
  }
  const rawMobile = customerMobile || shippingDetails?.phone || phone;
  if (rawMobile) {
    const cleanMobile = cleanPhone(rawMobile);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return 'A valid 10-digit customer mobile phone number is required for checkout.';
    }
    if (req.body.customerMobile) req.body.customerMobile = cleanMobile;
    if (req.body.shippingDetails && req.body.shippingDetails.phone) {
      req.body.shippingDetails.phone = cleanMobile;
    }
  }
  return null;
};
