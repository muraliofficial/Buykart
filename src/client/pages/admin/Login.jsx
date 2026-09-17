import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/common/MaterialIcon';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import logoImg from '../../assets/logo.png';

const Login = () => {
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('session_expired')) {
      return 'Admin session expired or authentication required. Please sign in to continue.';
    }
    return '';
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Please fill in both username and password.');
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      toast.success(`Welcome back, ${username}!`);
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(res.message);
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D4715] via-[#1b5e20] to-[#2d4a22] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner overflow-hidden">
            <img src={logoImg} alt="Buykart Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Buykart Admin</h1>
        </div>

        {/* Alert Error Message */}
        {errorMsg && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-100 p-3.5 rounded-xl text-xs flex items-center gap-2.5 backdrop-blur-sm">
            <span className="text-red-300 shrink-0">
              <MaterialIcon name="error" size={18} />
            </span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 flex items-center pointer-events-none">
                <MaterialIcon name="person" size={20} />
              </span>
              <input
                type="text"
                placeholder="Username or Phone Number"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/50 transition text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 flex items-center pointer-events-none">
                <MaterialIcon name="lock" size={20} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/50 transition text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition cursor-pointer flex items-center"
              >
                <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-semibold text-emerald-100">Demo: <strong className="text-white">admin</strong> / <strong className="text-white">admin123</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
              }}
              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded cursor-pointer"
            >
              Fill Demo
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E9762B] hover:bg-[#d6651d] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2 active:scale-95"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <MaterialIcon name="login" size={18} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-2 text-center border-t border-white/10 space-y-2">
          <p className="text-xs text-white/80">
            Don't have an account?{' '}
            <Link to="/admin/register" className="font-bold text-[#E9762B] hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
