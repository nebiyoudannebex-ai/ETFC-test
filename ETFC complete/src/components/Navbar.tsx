import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LogoFull } from './Logo';
import type { User } from '../store';
import {
  Home, Trophy, Swords, Users, Shield, LogOut, Menu, X, MessageSquare, User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Navbar({ currentUser, currentPage, onNavigate, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'fighters', label: 'Fighters', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Trophy },
    { id: 'news', label: 'News', icon: MessageSquare },
  ];

  if (currentUser) {
    // Only show "Request Fight" if the user is an approved fighter
    if (currentUser.isFighter) {
      navItems.push({ id: 'fight-request', label: 'Request Fight', icon: Swords });
    }
    navItems.push({ id: 'profile', label: 'Profile', icon: UserIcon });
  }

  if (currentUser?.isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-amber-500/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="cursor-pointer">
            <LogoFull size="sm" />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    currentPage === item.id
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-400 hover:text-amber-400 hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} />
                  {item.label}
                </motion.button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {currentUser.displayName}
                  {currentUser.isVerified && (
                    <span className="ml-1 text-amber-400">✓</span>
                  )}
                </span>
                <motion.button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={16} />
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-amber-400 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-amber-500/10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      currentPage === item.id
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-gray-400 hover:text-amber-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-3 border-t border-gray-800">
                {currentUser ? (
                  <button
                    onClick={() => { onLogout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => { onNavigate('login'); setMobileOpen(false); }}
                      className="w-full px-4 py-3 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { onNavigate('register'); setMobileOpen(false); }}
                      className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-red-600 text-white cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
