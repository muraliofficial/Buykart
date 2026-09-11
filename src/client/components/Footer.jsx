import React from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from './common/MaterialIcon';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-black text-2xl">
              <img
                src="/public/img/logo(1).png"
                alt="Buykart Logo"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <span>Buykart</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Your trusted partner for fresh groceries, farm-fresh produce, and daily household essentials delivered fast.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>Store Catalog</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>View Shopping Cart</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Customer Services</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/account" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>My Profile & Account</span>
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>My Orders & Live Tracking</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>Admin Control Center</span>
                </Link>
              </li>
              <li>
                <Link to="/ontime/login" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <MaterialIcon name="chevron_right" size={16} className="text-slate-500" />
                  <span>OnTime Rider Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm mb-4">Contact Info</h4>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
              <MaterialIcon name="location_on" size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>24/74E, Vettukattu valasu, Erode - 638011</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400">
              <MaterialIcon name="call" size={18} className="text-emerald-400 shrink-0" />
              <span>+91 6383217328</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400">
              <MaterialIcon name="mail" size={18} className="text-emerald-400 shrink-0" />
              <span>support@buykart.com</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 font-black px-2.5 py-1 rounded-md border border-emerald-500/20">
              Buykart Platform v2.5
            </span>
            <span>© {new Date().getFullYear()} Buykart Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <span>Crafted with care by</span>
            <a
              href="http://my-self-murali.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-extrabold underline hover:text-emerald-300 transition"
            >
              Murali (App Creator)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
