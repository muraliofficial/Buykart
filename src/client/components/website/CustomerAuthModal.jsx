import React, { useState } from 'react';
import { Phone, ShieldCheck, User, Mail, MapPin, ArrowRight, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CustomerAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginCustomer } = useAuth();

  const [step, setStep] = useState('MOBILE'); // 'MOBILE' | 'OTP' | 'PROFILE'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    pincode: ''
  });

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.post('/website/customer/send-otp', { mobile: cleanMobile });
      } catch (err) {
        res = await axios.post('/customer/send-otp', { mobile: cleanMobile });
      }
      setLoading(false);
      const simulatedOtp = res.data?.otp || '1234';
      console.log(`[OTP] Sent to ${cleanMobile}: ${simulatedOtp}`);
      showToast(`🔑 Test OTP for ${cleanMobile} is ${simulatedOtp}`);
      setStep('OTP');
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage('Please enter the 4-digit OTP');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/website/customer/verify-otp', { mobile, otp });
      setLoading(false);
      const { isNew, customer } = res.data;

      if (isNew || !customer?.name) {
        showToast('OTP Verified! Please complete your profile.');
        setStep('PROFILE');
      } else {
        loginCustomer(customer, res.data.token);
        showToast(`Welcome back, ${customer.name}!`);
        if (onSuccess) onSuccess(customer);
        setTimeout(() => onClose(), 600);
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      const fullAddress = `${profileData.street}, ${profileData.city} - ${profileData.pincode}`.trim();
      const payload = {
        name: profileData.name,
        mobile,
        email: profileData.email,
        addresses: fullAddress ? [fullAddress] : []
      };

      const res = await axios.post('/website/customer/profile', payload);
      setLoading(false);
      loginCustomer(res.data.customer, res.data.token);
      showToast('Profile completed successfully!');
      if (onSuccess) onSuccess(res.data.customer);
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.response?.data?.message || 'Failed to save profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="bg-[#0D4715] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0D4715] to-[#1b6b25] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Customer Login</h3>
              <p className="text-xs text-emerald-100 font-medium">Quick & secure OTP access</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER */}
          {step === 'MOBILE' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit mobile number"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  We'll send a 4-digit test OTP to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0D4715] hover:bg-[#1b6b25] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 font-medium">
                OTP sent to <span className="font-bold text-[#0D4715]">+91 {mobile}</span>.{' '}
                <button
                  type="button"
                  onClick={() => setStep('MOBILE')}
                  className="underline text-emerald-700 font-bold ml-1"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Enter 4-Digit OTP
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 1234"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-black tracking-widest text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
                  (Temporary testing OTP: <strong className="text-emerald-800 font-extrabold">1234</strong>)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0D4715] hover:bg-[#1b6b25] text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {/* STEP 3: COMPLETE PROFILE */}
          {step === 'PROFILE' && (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="text-xs text-gray-600 font-medium mb-1">
                Please complete your customer profile to place orders & track delivery.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="e.g. Murali Krishna"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="murali@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.street}
                    onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                    placeholder="Flat / House No, Street"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                    placeholder="Pincode"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#0D4715] hover:bg-[#1b6b25] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving Profile...' : 'Save & Complete Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
