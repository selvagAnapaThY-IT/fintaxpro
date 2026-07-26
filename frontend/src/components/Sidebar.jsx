import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  ShieldAlert, 
  Download, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';

import Logo from './Logo';

export default function Sidebar({ closeMobileMenu }) {
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (closeMobileMenu) closeMobileMenu();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Tax Vault', path: '/tax-vault', icon: ShieldAlert },
    { name: 'Export Center', path: '/exports', icon: Download },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 dark:bg-navy-950 border-r border-slate-800 dark:border-navy-900/60 font-sans shadow-xl">
      {/* Brand Header */}
      <div className="flex items-center px-5 h-20 border-b border-slate-800/80">
        <Logo size="sm" textColor="light" showTagline={true} />
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={closeMobileMenu}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive 
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-700/20 font-semibold' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }
            `}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition-all duration-150"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
