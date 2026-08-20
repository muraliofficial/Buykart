import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Shield,
  Truck,
  Receipt,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Purchase Entry', path: '/admin/purchase-entry', icon: Receipt },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Rider Master', path: '/admin/riders', icon: Truck },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <>
      {/* TOP ADMIN LIVE SYSTEM STATUS BAR */}
      <div className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              System Live & Online
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">Realtime Inventory & Order Sync</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link
              to="/"
              className="text-slate-300 hover:text-emerald-400 transition font-bold flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" /> Customer Website <ArrowUpRight className="w-3 h-3" />
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              to="/ontime/login"
              className="text-amber-400 hover:text-amber-300 transition font-bold flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" /> OnTime Rider Portal <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN ADMIN CONTROL CENTER NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* BRAND LOGO & ADMIN BADGE */}
            <div className="flex items-center gap-8">
              <Link to="/admin/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
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
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Admin Control Panel
                  </span>
                </div>
              </Link>

              {/* DESKTOP NAV LINKS */}
              <nav className="hidden lg:flex items-center gap-1.5">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
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
                      <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-200' : 'text-slate-400 group-hover:text-emerald-400'}`} />
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
                    {currentUser?.name || 'MURALI'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer ml-1"
                  title="Log Out Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* MOBILE MENU DRAWER TOGGLE */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                const Icon = link.icon;
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
                    <Icon className="w-4 h-4 text-emerald-400" />
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
                  <Truck className="w-4 h-4 text-amber-400" /> Switch to OnTime Rider App
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" /> Switch to Customer Website
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default AdminNavbar;
