import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiChatbotWidget from './AiChatbotWidget';
import { Menu, X, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const darkMode = useStore((state) => state.darkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar (fixed side) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-navy-900 shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar closeMobileMenu={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-navy-900/90 dark:backdrop-blur border-b border-slate-200 dark:border-navy-800/80 px-4 items-center justify-between shadow-sm md:shadow-none">
          <button
            type="button"
            className="px-4 border-r border-slate-200 dark:border-navy-800 text-slate-500 focus:outline-none md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-between px-4">
            <div className="flex items-center">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase hidden sm:inline-block">
                Financial Year: 2025-2026
              </span>
            </div>
            
            <div className="ml-4 flex items-center gap-4 md:ml-6">
              {/* Theme Toggler */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-800 transition-colors"
                title="Toggle Dark/Light Mode"
              >
                {darkMode ? <Sun className="h-5 w-5 text-teal-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
              </button>

              {/* User Dropdown/Menu Indicator */}
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-navy-800 pl-4">
                <div className="h-8 w-8 rounded-full bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-600 dark:text-teal-300 font-semibold font-sans">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden md:inline-block">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Views Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global AI Tax Assistant Chatbot Widget */}
      <AiChatbotWidget />
    </div>
  );
}

