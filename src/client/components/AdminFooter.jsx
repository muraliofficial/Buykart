import React from 'react';
import { Heart, Shield } from 'lucide-react';

const AdminFooter = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">Buykart Admin Workspace</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>by</span>
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
    </footer>
  );
};

export default AdminFooter;
