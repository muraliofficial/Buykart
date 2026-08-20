// Validation rules for Customer Website App
exports.validateSendOtp = (req) => {
  const rawMobile = req.body?.mobile;
  const cleanMobile = String(rawMobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile || cleanMobile.length !== 10) {
    return 'A valid 10-digit mobile number is required.';
  }
  req.body.mobile = cleanMobile;
  return null;
};

exports.validateVerifyOtp = (req) => {
  const rawMobile = req.body?.mobile;
  const cleanMobile = String(rawMobile || '').replace(/\D/g, '').slice(-10);
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
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return 'A valid 10-digit mobile number is required.';
  }
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
  const mobile = customerMobile || shippingDetails?.phone || phone;
  if (mobile && !/^\d{10}$/.test(String(mobile).trim())) {
    return 'A valid 10-digit customer mobile number is required for checkout.';
  }
  return null;
};
