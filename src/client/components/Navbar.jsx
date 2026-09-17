import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomerAuthModal from './website/CustomerAuthModal';
import MaterialIcon from './common/MaterialIcon';
import logoImg from '../assets/logo.png';

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
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'About Us', path: '/about', icon: 'info' },
    { name: 'Contact', path: '/contact', icon: 'contact_support' }
  ];

  if (customer) {
    navLinks.push({ name: 'My Orders', path: '/my-orders', icon: 'receipt_long' });
  }

  return (
    <>
      {/* MAIN NAVIGATION BAR (Express Delivery banner removed cleanly) */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* BRAND LOGO & DESKTOP NAV */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-xl">
                <div className="relative flex items-center">
                  <img
                    src={logoImg}
                    alt="Buykart Logo"
                    className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/img/logo(1).png';
                    }}
                  />
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/50 border border-emerald-500/30 scale-[1.02]'
                        : 'text-slate-300 hover:bg-slate-800/90 hover:text-white hover:border-slate-700 border border-transparent'
                        }`}
                    >
                      <MaterialIcon
                        name={link.icon}
                        size={18}
                        filled={isActive}
                        className={isActive ? 'text-emerald-200' : 'text-slate-400'}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* QUICK ACTIONS & PORTAL SWITCHERS */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">



              {/* CART BUTTON WITH LIVE COUNTER & PRICE */}
              <Link
                to="/cart"
                className="group relative flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl border border-slate-700 transition duration-200 shadow-md hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                title="Shopping Cart"
              >
                <div className="relative flex items-center">
                  <MaterialIcon
                    name="shopping_cart"
                    size={22}
                    className="text-emerald-400 group-hover:scale-110 transition-transform"
                  />
                  {totalItems > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Cart</span>
                  <span className="text-xs font-black text-emerald-400 leading-tight">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>

              {/* USER ACCOUNT DROPDOWN / LOGIN BUTTON */}
              <div className="relative">
                {activeUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 transition duration-200 cursor-pointer shadow-md hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      aria-expanded={dropdownOpen}
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                        {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Account</span>
                        <span className="text-xs font-black text-emerald-400 leading-tight max-w-[90px] truncate">
                          {activeUser.name || activeUser.mobile || 'Customer'}
                        </span>
                      </div>
                      <MaterialIcon
                        name={dropdownOpen ? 'expand_less' : 'expand_more'}
                        size={18}
                        className="text-slate-400"
                      />
                    </button>

                    {/* USER DROPDOWN MENU */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                          <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">Signed In As</p>
                          <p className="text-sm font-extrabold text-white truncate">{activeUser.name || 'Valued Customer'}</p>
                          {activeUser.mobile && (
                            <p className="text-xs text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                              <MaterialIcon name="phone" size={14} className="text-slate-500" />
                              {activeUser.mobile}
                            </p>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            to="/account"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition"
                          >
                            <MaterialIcon name="account_circle" size={18} className="text-emerald-400" />
                            My Account & Profile
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition"
                          >
                            <MaterialIcon name="local_shipping" size={18} className="text-blue-400" />
                            My Orders & Live Tracking
                          </Link>
                        </div>

                        <div className="my-1 border-t border-slate-800"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                        >
                          <MaterialIcon name="logout" size={18} />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <MaterialIcon name="person" size={18} />
                    <span>Customer Login</span>
                  </button>
                )}
              </div>

              {/* MOBILE MENU DRAWER TOGGLE */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Toggle Navigation Menu"
              >
                <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} size={24} />
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
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top duration-200">

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition ${isActive
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

          <div className="pt-2 border-t border-slate-800">
            {activeUser ? (
              <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-200 hover:text-emerald-400"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs">
                    {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-xs truncate max-w-[130px]">{activeUser.name || 'Account'}</p>
                    <p className="text-[10px] text-slate-400">View Profile & Addresses</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 py-3 rounded-2xl font-black text-xs shadow-md transition cursor-pointer"
              >
                <MaterialIcon name="person" size={18} />
                <span>Customer Login with OTP</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
