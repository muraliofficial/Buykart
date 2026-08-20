// Validation rules for OnTime Rider App
exports.validateRiderLogin = (req) => {
  const { mobile, otp } = req.body;
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return 'A valid 10-digit rider mobile number is required.';
  }
  if (!otp || String(otp).trim().length !== 4) {
    return 'A 4-digit verification OTP code is required.';
  }
  return null;
};

exports.validateUpdateRiderStatus = (req) => {
  const { status, failureReason } = req.body;
  const validStatuses = ['Dispatched', 'Out For Delivery', 'Delivered', 'Delivery Failed'];
  if (!status || !validStatuses.includes(status)) {
    return `Invalid order status. Allowed statuses: ${validStatuses.join(', ')}`;
  }
  if (status === 'Delivery Failed' && (!failureReason || String(failureReason).trim().length === 0)) {
    return 'A delivery failure reason must be selected.';
  }
  return null;
};
