import { motion } from 'framer-motion';
import { getUsers } from '../store';
import { Users, Search, Trophy, Shield } from 'lucide-react';
import { useState } from 'react';

export default function FightersPage() {
  const [search, setSearch] = useState('');
  const users = getUsers().filter(u => !u.isBanned && u.isFighter);
  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-['Bebas_Neue'] text-white tracking-wider flex items-center justify-center gap-3">
            <Users className="text-amber-400" size={40} />
            ALL <span className="text-amber-400">FIGHTERS</span>
          </h1>
          <p className="text-gray-500 mt-2">Browse all registered fighters on ETFC</p>
        </motion.div>

        {/* Search */}
        <motion.div
          className="max-w-md mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="Search fighters..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30 transition-all"
            />
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {filtered.map((fighter, i) => (
            <motion.div
              key={fighter.id}
              variants={{
                initial: { opacity: 0, y: 30, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Rank badge */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-700">
                #{i + 1}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-amber-500/20"
                  whileHover={{ rotate: 10 }}
                >
                  {fighter.username.charAt(0).toUpperCase()}
                </motion.div>
                <div>
                  <div className="text-white font-bold text-lg flex items-center gap-2">
                    {fighter.displayName}
                    {fighter.isFighter && <span className="text-red-500 text-sm font-bold ml-1" title="Fighter">✓</span>}
                    {fighter.isVerified && <span className="text-blue-400 text-sm ml-1" title="Verified">✓</span>}
                    {fighter.isAdmin && <Shield size={12} className="text-amber-400" />}
                  </div>
                  <div className="text-gray-500 text-sm">@{fighter.username}</div>
                </div>
              </div>

              {fighter.bio && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{fighter.bio}</p>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 text-center bg-green-500/10 rounded-lg py-3">
                  <div className="text-green-400 font-bold text-xl">{fighter.wins}</div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider">Wins</div>
                </div>
                <div className="flex-1 text-center bg-red-500/10 rounded-lg py-3">
                  <div className="text-red-400 font-bold text-xl">{fighter.losses}</div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider">Losses</div>
                </div>
                <div className="flex-1 text-center bg-amber-500/10 rounded-lg py-3">
                  <div className="text-amber-400 font-bold text-xl">
                    {fighter.wins + fighter.losses > 0
                      ? Math.round((fighter.wins / (fighter.wins + fighter.losses)) * 100)
                      : 0}%
                  </div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider">Win Rate</div>
                </div>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Trophy className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No fighters found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
