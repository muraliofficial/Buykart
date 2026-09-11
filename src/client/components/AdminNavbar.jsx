import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MaterialIcon from './common/MaterialIcon';
import logoImg from '../assets/logo.png';

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
    { name: 'Stock Inward', path: '/admin/purchase-entry', icon: 'post_add' },
    { name: 'Orders', path: '/admin/orders', icon: 'assignment' },
    { name: 'Riders', path: '/admin/riders', icon: 'two_wheeler' },
    { name: 'Users', path: '/admin/users', icon: 'group' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* BRAND LOGO & DESKTOP NAV */}
          <div className="flex items-center gap-8">
            <Link to="/admin/dashboard" className="flex items-center gap-3 focus:outline-none">
              <img
                src={logoImg}
                alt="Buykart Admin"
                className="h-9 w-auto object-contain transition-transform hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/img/logo(1).png';
                }}
              />
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Admin
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Admin Navigation">
              {adminLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <MaterialIcon
                      name={link.icon}
                      size={17}
                      filled={isActive}
                      className={isActive ? 'text-white' : 'text-slate-400'}
                    />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT QUICK ACTIONS & PROFILE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Links */}
            <div className="hidden sm:flex items-center gap-1 border-r border-slate-800 pr-3">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition text-xs flex items-center gap-1.5"
                title="Open Storefront in new tab"
              >
                <MaterialIcon name="storefront" size={17} />
                <span className="text-xs font-medium">Store</span>
              </Link>
              <Link
                to="/ontime/login"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition text-xs flex items-center gap-1.5"
                title="Open Rider App in new tab"
              >
                <MaterialIcon name="two_wheeler" size={17} />
                <span className="text-xs font-medium">Riders</span>
              </Link>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-2.5 bg-slate-800/80 pl-2 pr-3 py-1.5 rounded-xl border border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden md:inline-block text-xs font-medium text-slate-200 truncate max-w-[120px]">
                {currentUser?.name || 'Administrator'}
              </span>
              <button
                onClick={handleLogout}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition cursor-pointer ml-1"
                title="Log Out"
                aria-label="Log Out"
              >
                <MaterialIcon name="logout" size={16} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Toggle navigation menu"
            >
              <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 pt-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 bg-slate-800 hover:bg-slate-750'
                  }`}
                >
                  <MaterialIcon name={link.icon} size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 py-1"
            >
              <MaterialIcon name="storefront" size={16} />
              <span>Storefront</span>
            </Link>
            <Link
              to="/ontime/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 py-1"
            >
              <MaterialIcon name="two_wheeler" size={16} />
              <span>Rider Portal</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 py-1"
            >
              <MaterialIcon name="logout" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
