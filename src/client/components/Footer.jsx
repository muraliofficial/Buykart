import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Phone, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-2xl">
              <ShoppingBag className="w-7 h-7 text-[#E9762B]" />
              <span>Buykart</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted partner for fresh groceries, farm-fresh produce, and daily household essentials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">Store Catalog</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition">Contact Us</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-emerald-400 transition">View Shopping Cart</Link>
              </li>
            </ul>
          </div>

          {/* Admin Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Admin Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition">Admin Dashboard</Link>
              </li>
              <li>
                <Link to="/inventory" className="hover:text-emerald-400 transition">Manage Inventory</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition">Customer Orders</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base mb-4">Contact Info</h4>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>24/74E, Vettukattu valasu, Erode - 638011</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>+91 6383217328</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>support@buykart.com</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Buykart Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for quality grocery shopping.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
