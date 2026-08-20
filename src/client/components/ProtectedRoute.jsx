import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const isAdmin = currentUser.role === 'admin' || (currentUser.name && currentUser.name.toLowerCase() === 'admin');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Admin Access Required</h2>
          <p className="text-sm text-slate-500">
            Your account (<strong className="text-slate-800">{currentUser.name}</strong>) does not have administrator privileges to view this area.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-[#0D4715] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#41644A] transition"
            >
              <Home className="w-4 h-4" /> Go to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
