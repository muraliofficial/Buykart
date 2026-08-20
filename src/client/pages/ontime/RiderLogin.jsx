import React, { useState } from 'react';
import { Truck, Phone, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RiderLogin = () => {
  const { loginRider } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('MOBILE'); // 'MOBILE' | 'OTP'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    console.log(`[Rider OTP] Mobile: ${mobile}, OTP: 1234`);
    showToast(`🔑 Test OTP for Rider ${mobile} is 1234`);
    setStep('OTP');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 4-digit OTP');
      return;
    }
    setError('');
    setLoading(true);

    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

    try {
      let res;
      try {
        res = await axios.post('/ontime/rider/verify-otp', { mobile: cleanMobile, otp });
      } catch (err) {
        res = await axios.post('/ontime/verify-otp', { mobile: cleanMobile, otp });
      }
      setLoading(false);
      loginRider(res.data.rider, res.data.token);
      showToast(`Welcome, Rider ${res.data.rider.name}!`);
      setTimeout(() => navigate('/ontime/dashboard'), 600);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Rider login failed. Please check mobile & test OTP 1234.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 bg-amber-500 text-slate-950 px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-between shadow-2xl">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="font-black text-sm">✕</button>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">OnTime Delivery App</h1>
          <p className="text-xs text-slate-400 font-medium">Delivery Personnel Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: MOBILE */}
        {step === 'MOBILE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Registered Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter registered rider mobile"
                  className="w-full pl-14 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Rider Login OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-slate-900 p-3 rounded-xl text-xs text-slate-300 border border-slate-700 flex justify-between items-center">
              <span>OTP sent to <strong>+91 {mobile}</strong></span>
              <button
                type="button"
                onClick={() => setStep('MOBILE')}
                className="text-amber-400 font-bold underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enter 4-Digit OTP
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 1234"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <p className="mt-1.5 text-[11px] text-amber-400 font-medium">
                Testing Rider OTP: <strong>1234</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Open OnTime App'}
            </button>
          </form>
        )}

        {/* Info Note & Signature */}
        <div className="pt-3 border-t border-slate-700/50 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            ⚠️ Rider accounts cannot self-register. Accounts are created exclusively via the <strong>Admin App</strong>.
          </p>
          <div className="flex justify-center gap-3 text-xs font-bold pt-1">
            <Link to="/" className="text-emerald-400 hover:underline">Website</Link>
            <span className="text-slate-600">•</span>
            <Link to="/dashboard" className="text-cyan-400 hover:underline">Admin Panel</Link>
          </div>
          <div className="pt-2 text-[10px] text-slate-400 font-medium">
            <span>OnTime Rider App v2.5.0 • Developed by </span>
            <a
              href="http://my-self-murali.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-extrabold underline hover:text-amber-300 transition"
            >
              Murali (Portfolio ↗)
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiderLogin;
