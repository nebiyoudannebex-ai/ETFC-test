import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { LogoFull } from '../components/Logo';
import {
  getUserByUsername, getUserByEmail, getUserByGoogleId, getUserById,
  registerUser, setCurrentUser, verifyPassword, type User
} from '../store';
import {
  Eye, EyeOff, Lock, User as UserIcon, AlertCircle, CheckCircle, LogIn
} from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onNavigate: (page: string) => void;
  onLogin: (user: User) => void;
}

export default function AuthPage({ mode, onNavigate, onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');

  // Login states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Post-Google signup states
  const [googleUser, setGoogleUser] = useState<{
    email: string;
    name: string;
    sub: string;
    picture?: string;
  } | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);

  // UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const googleLoginRef = useRef(false);

  useEffect(() => {
    setIsLogin(mode === 'login');
    setError('');
    setSuccess('');
    setLoginUsername('');
    setLoginPassword('');
    setNewUsername('');
    setNewDisplayName('');
    setNewPassword('');
    setNewConfirmPassword('');
    setGoogleUser(null);
    setShowSignupForm(false);
    googleLoginRef.current = false;
  }, [mode]);

  // ─── Google OAuth ───
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
        .then(res => res.json())
        .then(info => {
          if (!info.email_verified) {
            setError('Your Google email is not verified.');
            return;
          }

          const googleInfo = {
            email: info.email,
            name: info.name,
            sub: info.sub,
            picture: info.picture,
          };

          const existingByGoogle = getUserByGoogleId(googleInfo.sub);
          const existingByEmail = getUserByEmail(googleInfo.email);

          if (existingByGoogle || existingByEmail) {
            const user = existingByGoogle || existingByEmail!;

            // Link Google account if not yet linked
            if (!user.googleId && existingByEmail) {
              const users = JSON.parse(localStorage.getItem('etfc_users') || '[]');
              const idx = users.findIndex((u: any) => u.id === user.id);
              if (idx !== -1) {
                users[idx].googleId = googleInfo.sub;
                if (googleInfo.picture) users[idx].avatar = googleInfo.picture;
                localStorage.setItem('etfc_users', JSON.stringify(users));
              }
            }

            setCurrentUser(user.id);
            setSuccess('Signed in with Google!');
            setTimeout(() => {
              onLogin(getUserById(user.id) || user);
              onNavigate('home');
            }, 1000);
            return;
          }

          // New user — show the username/password setup form
          setGoogleUser(googleInfo);
          setNewDisplayName(googleInfo.name);
          setShowSignupForm(true);
        })
        .catch(() => setError('Failed to get your profile. Please try again.'));
    },
    onError: () => setError('Google sign-in failed. Please try again.'),
    flow: 'implicit',
  });

  // ─── Complete signup: set username + password ───
  const handleCompleteSignup = () => {
    setError('');

    if (!newUsername.trim()) { setError('Username is required'); return; }
    if (newUsername.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    if (!newPassword.trim()) { setError('Password is required'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== newConfirmPassword) { setError('Passwords do not match'); return; }
    if (!googleUser?.email) { setError('Missing Google info. Please sign in again.'); return; }

    const existingByUsername = getUserByUsername(newUsername);
    if (existingByUsername) {
      setError('This username is already taken. Please choose another.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const user = registerUser(
          newUsername, googleUser.email, newPassword, newDisplayName, googleUser.sub
        );

        if (googleUser?.picture) {
          const users = JSON.parse(localStorage.getItem('etfc_users') || '[]');
          const idx = users.findIndex((u: any) => u.id === user.id);
          if (idx !== -1) {
            users[idx].avatar = googleUser.picture;
            localStorage.setItem('etfc_users', JSON.stringify(users));
          }
        }

        setCurrentUser(user.id);
        setSuccess('Account created!');
        setTimeout(() => { onLogin(user); onNavigate('home'); }, 1000);
      } catch (err: any) {
        setError(err.message || 'Registration failed');
      }
      setLoading(false);
    }, 500);
  };

  // ─── Login with username + password ───
  const handleLogin = () => {
    setError('');
    if (!loginUsername.trim()) { setError('Username is required'); return; }
    if (!loginPassword.trim()) { setError('Password is required'); return; }

    const user = getUserByUsername(loginUsername);
    if (!user) { setError('User not found. Please check your username.'); return; }
    if (user.isBanned) { setError('This account has been banned.'); return; }
    if (!verifyPassword(user, loginPassword)) { setError('Incorrect password.'); return; }

    setLoading(true);
    setTimeout(() => {
      setCurrentUser(user.id);
      setSuccess('Login successful!');
      setTimeout(() => { onLogin(user); onNavigate('home'); }, 1000);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <motion.div className="absolute top-0 left-0 w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </motion.div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="flex justify-center mb-6">
            <LogoFull size="md" />
          </div>

          <AnimatePresence mode="wait">
            {/* =========== REGISTER FLOW =========== */}
            {!isLogin && !showSignupForm && (
              <motion.div
                key="register-google"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-['Bebas_Neue'] text-white text-center mb-2 tracking-wider">CREATE ACCOUNT</h2>
                <p className="text-gray-500 text-sm text-center mb-6">Sign up with your Google account</p>

                <motion.button
                  onClick={() => {
                    if (!googleLoginRef.current) {
                      googleLoginRef.current = true;
                      googleLogin();
                      setTimeout(() => { googleLoginRef.current = false; }, 3000);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium border border-gray-700 text-white hover:bg-gray-800/50 hover:border-amber-500/30 transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogIn size={20} className="text-amber-400" />
                  Sign up with Google
                </motion.button>

                <p className="text-center text-gray-500 text-sm mt-6">
                  Already have an account?{' '}
                  <button onClick={() => onNavigate('login')} className="text-amber-400 hover:text-amber-300 cursor-pointer">Login</button>
                </p>
              </motion.div>
            )}

            {/* =========== SIGNUP FORM (after Google) =========== */}
            {!isLogin && showSignupForm && googleUser && (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-['Bebas_Neue'] text-white text-center mb-2 tracking-wider">SET UP YOUR PROFILE</h2>
                <p className="text-gray-500 text-sm text-center mb-6">
                  Choose a username and password for future logins
                </p>

                <motion.div
                  className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {googleUser.picture ? (
                    <img src={googleUser.picture} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold">
                      {googleUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{googleUser.name}</p>
                    <p className="text-amber-400/70 text-xs truncate">{googleUser.email}</p>
                  </div>
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                </motion.div>

                <div className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="text"
                      placeholder="Username (unique)"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={newDisplayName}
                      onChange={e => setNewDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 characters)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 cursor-pointer">
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type={showNewConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={newConfirmPassword}
                      onChange={e => setNewConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 cursor-pointer">
                      {showNewConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  onClick={handleCompleteSignup}
                  disabled={loading}
                  className="w-full mt-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Creating Account…' : 'Create Account'}
                </motion.button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Already have an account?{' '}
                  <button onClick={() => { setShowSignupForm(false); onNavigate('login'); }} className="text-amber-400 hover:text-amber-300 cursor-pointer">Login</button>
                </p>
              </motion.div>
            )}

            {/* =========== LOGIN =========== */}
            {isLogin && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-['Bebas_Neue'] text-white text-center mb-2 tracking-wider">WELCOME BACK</h2>
                <p className="text-gray-500 text-sm text-center mb-6">Sign in to your account</p>

                <motion.button
                  onClick={() => {
                    if (!googleLoginRef.current) {
                      googleLoginRef.current = true;
                      googleLogin();
                      setTimeout(() => { googleLoginRef.current = false; }, 3000);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium border border-gray-700 text-white hover:bg-gray-800/50 hover:border-amber-500/30 transition-all cursor-pointer mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogIn size={20} className="text-amber-400" />
                  Sign in with Google
                </motion.button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-600 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type="text"
                      placeholder="Username"
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 cursor-pointer">
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full mt-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Logging in…' : 'Login'}
                </motion.button>

                <p className="text-center text-gray-500 text-sm mt-6">
                  Don't have an account?{' '}
                  <button onClick={() => onNavigate('register')} className="text-amber-400 hover:text-amber-300 cursor-pointer">Sign Up</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
