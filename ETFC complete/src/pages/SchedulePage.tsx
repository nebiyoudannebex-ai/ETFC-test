import { motion } from 'framer-motion';
import { getFightSchedules, formatTime } from '../store';
import { Calendar, Swords, MapPin, Clock, Trophy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function SchedulePage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const schedules = getFightSchedules();
  const filtered = filter === 'all' ? schedules : schedules.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-['Bebas_Neue'] text-white tracking-wider flex items-center justify-center gap-3">
            <Calendar className="text-amber-400" size={40} />
            FIGHT <span className="text-amber-400">SCHEDULE</span>
          </h1>
          <p className="text-gray-500 mt-2">All scheduled and past fights</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex justify-center gap-2 mb-10 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {(['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as const).map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize cursor-pointer transition-all ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-500 hover:text-white bg-gray-800/30 border border-gray-800'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {f}
            </motion.button>
          ))}
        </motion.div>

        {/* Fight cards */}
        <motion.div
          className="space-y-6"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          {filtered.map((fight) => (
            <motion.div
              key={fight.id}
              variants={{
                initial: { opacity: 0, x: -50 },
                animate: { opacity: 1, x: 0 },
              }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all duration-500"
              whileHover={{ scale: 1.01 }}
            >
              {/* Status bar */}
              <div className={`h-1 ${
                fight.status === 'upcoming' ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                fight.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                'bg-gradient-to-r from-gray-500 to-gray-600'
              }`} />

              <div className="p-6">
                {/* Fighters */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl mb-2"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      {fight.fighter1Username.charAt(0).toUpperCase()}
                    </motion.div>
                    <span className="text-white font-bold text-lg">@{fight.fighter1Username}</span>
                    {fight.winner === fight.fighter1Username && (
                      <div className="flex items-center justify-center gap-1 text-amber-400 text-sm mt-1">
                        <Trophy size={14} /> Winner
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      className={`px-6 py-3 rounded-xl text-2xl font-['Bebas_Neue'] tracking-widest ${
                        fight.status === 'upcoming'
                          ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white'
                          : fight.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                      animate={fight.status === 'upcoming' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      VS
                    </motion.div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      fight.status === 'upcoming' ? 'bg-amber-500/20 text-amber-400' :
                      fight.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {fight.status === 'upcoming' && <Clock size={10} className="inline mr-1" />}
                      {fight.status === 'completed' && <CheckCircle size={10} className="inline mr-1" />}
                      {fight.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-2xl mb-2"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {fight.fighter2Username.charAt(0).toUpperCase()}
                    </motion.div>
                    <span className="text-white font-bold text-lg">@{fight.fighter2Username}</span>
                    {fight.winner === fight.fighter2Username && (
                      <div className="flex items-center justify-center gap-1 text-amber-400 text-sm mt-1">
                        <Trophy size={14} /> Winner
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-400/60" />
                    {fight.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-400/60" />
                    {formatTime(fight.time)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-400/60" />
                    {fight.venue}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Swords className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No fights found</p>
            <p className="text-gray-700 text-sm mt-2">Check back soon for upcoming battles!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
