import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createFightRequest, getFightRequests, getUsers, type User } from '../store';
import { Swords, Search, Send, AlertCircle, CheckCircle, Clock, ChevronRight, Shield } from 'lucide-react';

export default function FightRequestPage({ currentUser }: { currentUser: User }) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const users = getUsers().filter(u =>
    !u.isBanned && u.isFighter && u.id !== currentUser.id &&
    (u.username.toLowerCase().includes(search.toLowerCase()) ||
     u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  const myRequests = getFightRequests().filter(
    r => r.fromUserId === currentUser.id || r.toUserId === currentUser.id
  );

  const handleRequest = () => {
    setError('');
    setSuccess('');

    if (!selectedUser) {
      setError('Please select a fighter to challenge');
      return;
    }

    if (currentUser.isRestricted) {
      setError('Your account is restricted. You cannot send fight requests.');
      return;
    }

    try {
      createFightRequest(currentUser, selectedUser, message);
      setSuccess(`Fight request sent to @${selectedUser}!`);
      setSelectedUser('');
      setMessage('');
      setSearch('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-['Bebas_Neue'] text-white tracking-wider flex items-center justify-center gap-3">
            <Swords className="text-amber-400" size={40} />
            REQUEST <span className="text-amber-400">FIGHT</span>
          </h1>
          <p className="text-gray-500 mt-2">Challenge another fighter to a match</p>
        </motion.div>

        {/* Verification status notice */}
        {!currentUser.isFighter && (
          <motion.div
            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Shield size={20} className="text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400 text-sm font-medium">You are not yet a verified fighter</p>
            <p className="text-gray-500 text-xs mt-1">
              Only verified fighters can send or receive challenges. Contact an admin to get verified.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Send Challenge</h2>

            {/* Search fighters */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input
                type="text"
                placeholder="Search fighters..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Fighter list */}
            {search && (
              <div className="max-h-48 overflow-y-auto mb-4 space-y-1 custom-scrollbar">
                {users.map(u => (
                  <motion.button
                    key={u.id}
                    onClick={() => { setSelectedUser(u.username); setSearch(''); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all ${
                      selectedUser === u.username
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'hover:bg-gray-800/50 border border-transparent'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium">@{u.username}</span>
                      <span className="text-gray-500 text-xs ml-2">{u.displayName}</span>
                    </div>
                  </motion.button>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-4">No fighters found</p>
                )}
              </div>
            )}

            {/* Selected fighter */}
            {selectedUser && (
              <motion.div
                className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-2">
                  <Swords size={16} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">Challenging @{selectedUser}</span>
                </div>
                <button
                  onClick={() => setSelectedUser('')}
                  className="text-gray-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {/* Message */}
            <textarea
              placeholder="Add a message (optional) - e.g., I challenge you to prove who's the best!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none mb-4"
            />

            <motion.button
              onClick={handleRequest}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center gap-2">
                <Send size={18} /> Send Challenge
              </span>
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-green-400 text-sm">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* My Requests */}
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">My Requests</h2>
            <div className="space-y-3">
              {myRequests.length > 0 ? myRequests.map(req => (
                <motion.div
                  key={req.id}
                  className="p-4 bg-gray-800/30 border border-gray-800 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className={`font-bold ${req.fromUserId === currentUser.id ? 'text-amber-400' : 'text-white'}`}>
                      @{req.fromUsername}
                    </span>
                    <ChevronRight size={14} className="text-gray-600" />
                    <Swords size={14} className="text-red-400" />
                    <ChevronRight size={14} className="text-gray-600" />
                    <span className={`font-bold ${req.toUserId === currentUser.id ? 'text-amber-400' : 'text-white'}`}>
                      @{req.toUsername}
                    </span>
                  </div>
                  {req.message && <p className="text-gray-400 text-sm italic mb-2">"{req.message}"</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-12">
                  <Swords className="mx-auto text-gray-700 mb-3" size={36} />
                  <p className="text-gray-600 text-sm">No fight requests yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
