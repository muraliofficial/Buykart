import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MaterialIcon from './common/MaterialIcon';

const AdminNavbar = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Inventory', path: '/admin/inventory', icon: 'inventory_2' },
    { name: 'Stock Entry', path: '/admin/purchase-entry', icon: 'post_add' },
    { name: 'Orders', path: '/admin/orders', icon: 'assignment' },
    { name: 'Rider Fleet', path: '/admin/riders', icon: 'two_wheeler' },
    { name: 'User Directory', path: '/admin/users', icon: 'group' },
  ];

  return (
    <>
      {/* TOP ADMIN STATUS BAR */}
      <div className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
              <MaterialIcon name="wifi" size={14} className="animate-pulse" />
              Live Workspace Online
            </span>
            <span className="hidden sm:inline text-slate-400 text-xs">Real-Time Inventory & Dispatch Operations</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              to="/"
              className="text-slate-300 hover:text-emerald-400 transition flex items-center gap-1"
            >
              <MaterialIcon name="storefront" size={16} className="text-emerald-400" />
              <span>Customer Storefront</span>
              <MaterialIcon name="north_east" size={12} />
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              to="/ontime/login"
              className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
            >
              <MaterialIcon name="two_wheeler" size={16} className="text-amber-400" />
              <span>OnTime Rider App</span>
              <MaterialIcon name="north_east" size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN ADMIN HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* BRAND LOGO & ADMIN BADGE */}
            <div className="flex items-center gap-8">
              <Link to="/admin/dashboard" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-xl">
                <div className="relative flex items-center">
                  <img
                    src="/public/img/logo(1).png"
                    alt="Buykart Admin Logo"
                    className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/160x50/0D4715/FFFFFF?text=Buykart+Admin';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="hidden sm:flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                    <MaterialIcon name="admin_panel_settings" size={14} />
                    Admin Control Panel
                  </span>
                </div>
              </Link>

              {/* DESKTOP NAV LINKS */}
              <nav className="hidden lg:flex items-center gap-1.5" aria-label="Admin Navigation">
                {adminLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/50 border border-emerald-500/30 scale-[1.02]'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700 border border-transparent'
                      }`}
                    >
                      <MaterialIcon
                        name={link.icon}
                        size={18}
                        filled={isActive}
                        className={`transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT USER PROFILE & LOGOUT */}
            <div className="flex items-center gap-3">
              
              {/* LOGGED IN ADMIN BADGE */}
              <div className="flex items-center gap-3 bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-700 shadow-md">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                </div>

                <div className="hidden md:flex flex-col">
                  <span className="text-[10px] uppercase font-black text-slate-400 leading-tight">Admin User</span>
                  <span className="text-xs font-black text-emerald-400 leading-tight">
                    {currentUser?.name || 'Staff Member'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer ml-1"
                  title="Log Out Admin"
                  aria-label="Log Out Admin"
                >
                  <MaterialIcon name="logout" size={18} />
                </button>
              </div>

              {/* MOBILE MENU DRAWER TOGGLE */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                aria-label="Toggle Admin Navigation Menu"
              >
                <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} size={24} />
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE DRAWER NAVIGATION MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-1">
              Admin Workspace Modules
            </div>

            <div className="grid grid-cols-2 gap-2">
              {adminLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                        : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <MaterialIcon
                      name={link.icon}
                      size={20}
                      filled={isActive}
                      className={isActive ? 'text-white' : 'text-emerald-400'}
                    />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/ontime/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <MaterialIcon name="two_wheeler" size={18} className="text-amber-400" /> Switch to OnTime Rider App
                </span>
                <MaterialIcon name="chevron_right" size={16} />
              </Link>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <MaterialIcon name="storefront" size={18} className="text-emerald-400" /> Switch to Customer Website
                </span>
                <MaterialIcon name="chevron_right" size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default AdminNavbar;
