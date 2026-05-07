import { motion } from 'framer-motion';
import { LogoFull } from '../components/Logo';
import { Swords, Trophy, Users, Shield, ChevronDown, Flame, Star, Zap, CheckCircle } from 'lucide-react';
import { getFightSchedules, getUsers, getTweets, getTopFighters } from '../store';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, type: 'spring' },
};

const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, type: 'spring' },
};

export default function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const schedules = getFightSchedules().filter(s => s.status === 'upcoming').slice(0, 3);
  const allUsers = getUsers().filter(u => !u.isBanned);
  const verifiedFighters = allUsers.filter(u => u.isFighter);
  const topFightersData = getTopFighters();
  const topFighterUsers = topFightersData.map(tf => ({
    entry: tf,
    user: allUsers.find(u => u.username.toLowerCase() === tf.username.toLowerCase())
  })).filter(item => item.user) as { entry: NonNullable<ReturnType<typeof getTopFighters>[0]>; user: NonNullable<ReturnType<typeof getUsers>[0]> }[];
  const tweets = getTweets().slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <LogoFull size="lg" />
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-['Bebas_Neue'] text-white mb-4 leading-none"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
              UNLEASH
            </span>{' '}
            YOUR{' '}
            <span className="bg-gradient-to-r from-red-500 via-amber-400 to-red-500 bg-clip-text text-transparent">
              WARRIOR
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-['Inter']"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Ethiopia's premier fighting championship platform. Register, challenge opponents,
            and rise through the ranks to become the ultimate champion.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/25 cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(245,158,11,0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Flame size={20} />
                Join The Arena
              </span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate('schedule')}
              className="px-8 py-4 rounded-xl text-lg font-bold border-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Trophy size={20} />
                View Fights
              </span>
            </motion.button>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="text-amber-500/50" size={32} />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-gray-950 to-gray-900"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: allUsers.length.toString(), label: 'Members', color: 'from-blue-500 to-cyan-500' },
            { icon: Shield, value: verifiedFighters.length.toString(), label: 'Fighters', color: 'from-amber-500 to-orange-500' },
            { icon: CheckCircle, value: allUsers.filter(u => u.isVerified).length.toString(), label: 'Verified', color: 'from-blue-500 to-indigo-500' },
            { icon: Swords, value: schedules.length.toString(), label: 'Upcoming Fights', color: 'from-red-500 to-pink-500' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-500">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="text-3xl font-['Bebas_Neue'] text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Upcoming Fights */}
      <motion.section
        className="py-20 px-4 bg-gray-900"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-['Bebas_Neue'] text-white mb-4">
              <Zap className="inline text-amber-400 mr-2" size={36} />
              UPCOMING <span className="text-amber-400">BATTLES</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">The most anticipated fights are coming. Don't miss the action.</p>
          </motion.div>

          {schedules.length > 0 ? (
            <motion.div className="space-y-6" variants={stagger}>
              {schedules.map((fight, i) => (
                <motion.div
                  key={fight.id}
                  variants={i % 2 === 0 ? slideInLeft : slideInRight}
                  className="bg-gray-950/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-500 group"
                  whileHover={{ scale: 1.02, x: i % 2 === 0 ? 10 : -10 }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold">
                        {fight.fighter1Username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-lg font-bold text-white">{fight.fighter1Username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 text-white font-['Bebas_Neue'] text-xl tracking-wider"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        VS
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-white">{fight.fighter2Username}</span>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white font-bold">
                        {fight.fighter2Username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
                    <span>📅 {fight.date}</span>
                    <span>⏰ {fight.time}</span>
                    <span>📍 {fight.venue}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} className="text-center py-16">
              <Swords className="mx-auto text-gray-700 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No upcoming fights scheduled yet.</p>
              <p className="text-gray-700 text-sm mt-2">Check back later for exciting matchups!</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Top Fighters */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-950"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-['Bebas_Neue'] text-white mb-4">
              <Star className="inline text-amber-400 mr-2" size={36} />
              TOP <span className="text-amber-400">FIGHTERS</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">The best of the best. Rising champions of ETFC.</p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger}>
            {topFighterUsers.length > 0 ? topFighterUsers.map(({ entry, user }, i) => (
              <motion.div
                key={entry.username}
                variants={fadeInUp}
                className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-500 group overflow-hidden"
                whileHover={{ y: -5 }}
              >
                {i < 3 && (
                  <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : 'bg-amber-700 text-white'
                  }`}>
                    {i + 1}
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-bold flex items-center gap-1">
                      {user.displayName}
                      {user.isFighter && <span className="text-red-500 text-sm font-bold" title="Fighter">✓</span>}
                      {user.isVerified && <span className="text-blue-400 text-sm" title="Verified">✓</span>}
                    </div>
                    <div className="text-gray-500 text-sm">@{user.username}</div>
                  </div>
                </div>
                <p className="text-amber-400/80 text-sm italic mb-3 text-center">"{entry.reason}"</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center bg-green-500/10 rounded-lg py-2">
                    <div className="text-green-400 font-bold text-lg">{user.wins}</div>
                    <div className="text-gray-500 text-xs">Wins</div>
                  </div>
                  <div className="flex-1 text-center bg-red-500/10 rounded-lg py-2">
                    <div className="text-red-400 font-bold text-lg">{user.losses}</div>
                    <div className="text-gray-500 text-xs">Losses</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-16">
                <Star className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-600 text-lg">No top fighters selected yet.</p>
                <p className="text-gray-700 text-sm mt-2">The admin will feature fighters here soon!</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* News/Tweets Section */}
      {tweets.length > 0 && (
        <motion.section
          className="py-20 px-4 bg-gray-950"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <h2 className="text-4xl sm:text-5xl font-['Bebas_Neue'] text-white mb-4">
                LATEST <span className="text-amber-400">NEWS</span>
              </h2>
            </motion.div>
            <motion.div className="space-y-4" variants={stagger}>
              {tweets.map(tweet => (
                <motion.div
                  key={tweet.id}
                  variants={fadeInUp}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-amber-500/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold">
                      {tweet.authorUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white font-semibold">@{tweet.authorUsername}</span>
                      <span className="text-gray-600 text-sm ml-2">
                        {new Date(tweet.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{tweet.content}</p>
                  <div className="mt-3 text-sm text-gray-600">❤️ {tweet.likes} likes</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <LogoFull size="sm" />
          <p className="text-gray-600 text-sm mt-4">
            © {new Date().getFullYear()} ETFC - Ethiopian Fighting Champs. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs mt-2">
            The ultimate platform for Ethiopian fighters to compete and prove their worth.
          </p>
        </div>
      </footer>
    </div>
  );
}
