import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  Store,
  Home,
  Info,
  Phone,
  Package,
  Truck,
  UserCheck,
  MapPin,
  Sparkles,
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomerAuthModal from './website/CustomerAuthModal';

const Navbar = () => {
  const { customer, logoutCustomer } = useAuth();
  const { getTotalItems, getTotalPrice } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const activeUser = customer;

  const handleLogout = () => {
    logoutCustomer();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  if (activeUser) {
    navLinks.push({ name: 'My Profile', path: '/account', icon: UserCheck });
    navLinks.push({ name: 'My Orders', path: '/my-orders', icon: Package });
  }

  return (
    <>
      {/* TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-slate-200 border-b border-emerald-500/20 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 font-semibold text-emerald-300">
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[11px] font-black tracking-wide uppercase animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Express Delivery
            </span>
            <span className="hidden md:inline text-slate-300">Fresh Groceries & Essentials Delivered in 15 Minutes!</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Erode - 638011</span>
            </div>

            <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center gap-2 font-bold">
              <Link to="/admin/dashboard" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Admin
              </Link>
              <span className="text-slate-600">•</span>
              <Link to="/ontime/login" className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1">
                <Truck className="w-3 h-3 text-amber-400" /> OnTime Rider
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* BRAND LOGO & LINKS */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center">
                  <img
                    src="/public/img/logo(1).png"
                    alt="Buykart Logo"
                    className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/150x50/0D4715/FFFFFF?text=Buykart';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/50 border border-emerald-500/30 scale-[1.02]'
                          : 'text-slate-300 hover:bg-slate-800/90 hover:text-white hover:border-slate-700 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              
              {/* CART BUTTON WITH LIVE COUNTER & PRICE */}
              <Link
                to="/cart"
                className="group relative flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl border border-slate-700 transition duration-200 shadow-md hover:border-emerald-500/50"
                title="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-slate-900 animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">My Cart</span>
                  <span className="text-xs font-black text-emerald-400 leading-tight">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </Link>

              {/* USER ACCOUNT DROPDOWN / LOGIN BUTTON */}
              <div className="relative">
                {activeUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 transition duration-200 cursor-pointer shadow-md hover:border-slate-600"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                        {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Account</span>
                        <span className="text-xs font-black text-emerald-400 leading-tight max-w-[100px] truncate">
                          {activeUser.name || activeUser.mobile || 'Customer'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                    </button>

                    {/* USER DROPDOWN MENU */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                          <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">Signed In As</p>
                          <p className="text-sm font-extrabold text-white truncate">{activeUser.name || 'Valued Customer'}</p>
                          {activeUser.mobile && <p className="text-xs text-slate-400 font-bold mt-0.5">{activeUser.mobile}</p>}
                        </div>

                        <div className="py-1">
                          <Link
                            to="/account"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition"
                          >
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            My Account & Profile
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition"
                          >
                            <Package className="w-4 h-4 text-blue-400" />
                            My Orders & Live Tracking
                          </Link>
                        </div>

                        <div className="my-1 border-t border-slate-800"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-red-400 hover:bg-red-500/10 transition text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out Account
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Customer Login</span>
                  </button>
                )}
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
      </header>

      {/* CUSTOMER AUTH MODAL */}
      {authModalOpen && (
        <CustomerAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      )}

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-1">
            Storefront Navigation
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
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
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Open Admin Portal
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/ontime/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" /> Open OnTime Rider App
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
