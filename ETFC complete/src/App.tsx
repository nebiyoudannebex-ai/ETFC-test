import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import FightersPage from './pages/FightersPage';
import SchedulePage from './pages/SchedulePage';
import NewsPage from './pages/NewsPage';
import FightRequestPage from './pages/FightRequestPage';
import ProfilePage from './pages/ProfilePage';
import { getCurrentUser, logout, getUserById, type User } from './store';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const handleNavigate = (page: string) => {
    // Protect routes
    if (['fight-request', 'profile'].includes(page) && !currentUser) {
      setCurrentPage('login');
      return;
    }
    if (page === 'admin' && (!currentUser || !currentUser.isAdmin)) {
      setCurrentPage('home');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const refreshUser = () => {
    if (currentUser) {
      const updated = getUserById(currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          className="text-amber-400 text-4xl font-['Orbitron'] font-black"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ETFC
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Inter']">
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        <motion.div key={currentPage} {...pageTransition}>
          {currentPage === 'home' && (
            <HomePage onNavigate={handleNavigate} />
          )}

          {currentPage === 'login' && (
            <AuthPage mode="login" onNavigate={handleNavigate} onLogin={handleLogin} />
          )}

          {currentPage === 'register' && (
            <AuthPage mode="register" onNavigate={handleNavigate} onLogin={handleLogin} />
          )}

          {currentPage === 'fighters' && (
            <FightersPage />
          )}

          {currentPage === 'schedule' && (
            <SchedulePage />
          )}

          {currentPage === 'news' && (
            <NewsPage currentUser={currentUser} />
          )}

          {currentPage === 'fight-request' && currentUser && (
            <FightRequestPage currentUser={currentUser} />
          )}

          {currentPage === 'profile' && currentUser && (
            <ProfilePage currentUser={currentUser} onUserUpdate={refreshUser} />
          )}

          {currentPage === 'admin' && currentUser?.isAdmin && (
            <AdminPage currentUser={currentUser} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
