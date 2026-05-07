import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getUsers, getFightRequests, getFightSchedules, getTweets, getTopFighters,
  verifyUser, unverifyUser, makeFighter, removeFighter,
  banUser, unbanUser, restrictUser, unrestrictUser,
  makeAdmin, createFightSchedule, updateFightRequest, createTweet,
  addTopFighter, removeTopFighter,
  isSuperAdminEmail, formatTime,
  type User, type FightRequest, type FightSchedule
} from '../store';
import {
  Shield, Users, Swords, MessageSquare, CheckCircle,
  Ban, AlertTriangle, UserPlus, Calendar, Send, Clock, ChevronRight, Star
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'verification', label: 'Verification', icon: CheckCircle },
  { id: 'requests', label: 'Fight Requests', icon: Swords },
  { id: 'schedule', label: 'Schedules', icon: Calendar },
  { id: 'moderation', label: 'Moderation', icon: Ban },
  { id: 'admins', label: 'Add Admin', icon: UserPlus },
  { id: 'top-fighters', label: 'Top Fighters', icon: Star },
  { id: 'tweets', label: 'Tweet', icon: MessageSquare },
];

export default function AdminPage({ currentUser }: { currentUser: User }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<FightRequest[]>([]);
  const [schedules, setSchedules] = useState<FightSchedule[]>([]);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form states
  const [adminUsername, setAdminUsername] = useState('');
  const [banUsername, setBanUsername] = useState('');
  const [restrictUsername, setRestrictUsername] = useState('');
  const [tweetContent, setTweetContent] = useState('');

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    fighter1Username: '',
    fighter2Username: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    image: '',
  });

  // Top fighter form
  const [topFighterUsername, setTopFighterUsername] = useState('');
  const [topFighterReason, setTopFighterReason] = useState('');

  const isSuper = isSuperAdminEmail(currentUser.email);

  const refreshData = () => {
    setUsers(getUsers());
    setRequests(getFightRequests());
    setSchedules(getFightSchedules());
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  const showMsg = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleVerifyToggle = (username: string, verified: boolean) => {
    if (verified) {
      unverifyUser(username);
      showMsg('success', `@${username} — blue check (Verified) removed`);
    } else {
      verifyUser(username);
      showMsg('success', `@${username} now has a blue verified check!`);
    }
    refreshData();
  };

  const handleFighterToggle = (username: string, fighter: boolean) => {
    if (fighter) {
      removeFighter(username);
      showMsg('success', `@${username} — fighter status (red check) revoked`);
    } else {
      makeFighter(username);
      showMsg('success', `@${username} is now an approved fighter with red check!`);
    }
    refreshData();
  };

  const handleBan = (username: string) => {
    banUser(username);
    showMsg('success', `@${username} has been banned`);
    refreshData();
  };

  const handleUnban = (username: string) => {
    unbanUser(username);
    showMsg('success', `@${username} has been unbanned`);
    refreshData();
  };

  const handleRestrict = (username: string) => {
    restrictUser(username);
    showMsg('success', `@${username} has been restricted`);
    refreshData();
  };

  const handleUnrestrict = (username: string) => {
    unrestrictUser(username);
    showMsg('success', `@${username} has been unrestricted`);
    refreshData();
  };

  const handleMakeAdmin = () => {
    if (!adminUsername.trim()) {
      showMsg('error', 'Please enter a username');
      return;
    }
    if (makeAdmin(adminUsername)) {
      showMsg('success', `@${adminUsername} is now an admin!`);
      setAdminUsername('');
      refreshData();
    } else {
      showMsg('error', `User @${adminUsername} not found`);
    }
  };

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    updateFightRequest(requestId, action);
    showMsg('success', `Request ${action}`);
    refreshData();
  };

  const handleCreateSchedule = () => {
    const { fighter1Username, fighter2Username, date, time, venue, description, image } = scheduleForm;
    if (!fighter1Username || !fighter2Username || !date || !time || !venue) {
      showMsg('error', 'All fields are required');
      return;
    }
    createFightSchedule({
      fighter1Username,
      fighter2Username,
      date,
      time,
      venue,
      description,
      image,
      status: 'upcoming',
    });
    showMsg('success', 'Fight schedule created!');
    setScheduleForm({ fighter1Username: '', fighter2Username: '', date: '', time: '', venue: '', description: '', image: '' });
    refreshData();
  };

  const handleTweet = () => {
    if (!tweetContent.trim()) {
      showMsg('error', 'Tweet content is required');
      return;
    }
    createTweet(currentUser.username, tweetContent);
    showMsg('success', 'Tweet posted!');
    setTweetContent('');
  };

  const handleAddTopFighter = () => {
    if (!topFighterUsername.trim() || !topFighterReason.trim()) {
      showMsg('error', 'Username and reason are required');
      return;
    }
    addTopFighter(topFighterUsername, topFighterReason, currentUser.username);
    showMsg('success', `@${topFighterUsername} added to top fighters!`);
    setTopFighterUsername('');
    setTopFighterReason('');
  };

  const handleRemoveTopFighter = (username: string) => {
    removeTopFighter(username);
    showMsg('success', `@${username} removed from top fighters`);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const nonFighters = users.filter(u => !u.isFighter && !u.isBanned);
  const topFighters = getTopFighters();

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-['Bebas_Neue'] text-white tracking-wider flex items-center gap-3">
            <Shield className="text-amber-400" size={36} />
            ADMIN <span className="text-amber-400">PANEL</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage ETFC platform as {currentUser.username}</p>
        </motion.div>

        {/* Message */}
        <AnimatePresence>
          {msg.text && (
            <motion.div
              className={`mb-6 p-4 rounded-xl border ${
                msg.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 h-fit lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const badge = tab.id === 'requests' ? pendingRequests.length :
                              tab.id === 'verification' ? nonFighters.length : 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {tab.label}
                    </span>
                    {badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {/* Overview */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">DASHBOARD OVERVIEW</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Total Members', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
                      { label: 'Fighters (Red ✓)', value: users.filter(u => u.isFighter).length, icon: Shield, color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10' },
                      { label: 'Verified (Blue ✓)', value: users.filter(u => u.isVerified).length, icon: CheckCircle, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10' },
                      { label: 'Pending Requests', value: pendingRequests.length, icon: Clock, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
                      { label: 'Upcoming Fights', value: schedules.filter(s => s.status === 'upcoming').length, icon: Swords, color: 'from-red-500 to-pink-500', bg: 'bg-red-500/10' },
                      { label: 'Top Fighters', value: topFighters.length, icon: Star, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={i}
                          className={`${stat.bg} border border-gray-800 rounded-xl p-5`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-3`}>
                            <Icon className="text-white" size={20} />
                          </div>
                          <div className="text-3xl font-['Bebas_Neue'] text-white">{stat.value}</div>
                          <div className="text-sm text-gray-500">{stat.label}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <h3 className="text-lg font-bold text-white mt-8 mb-4">Recent Users</h3>
                  <div className="space-y-2">
                    {users.slice(-5).reverse().map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white text-sm font-medium">@{u.username}</span>
                            <span className="text-gray-600 text-xs ml-2">{u.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {u.isFighter && <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Fighter</span>}
                          {u.isVerified && <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">Verified</span>}
                          {u.isBanned && <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Banned</span>}
                          {u.isAdmin && <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">Admin</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">ALL USERS</h2>
                  <div className="space-y-3">
                    {users.map(u => (
                      <motion.div
                        key={u.id}
                        className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-xl hover:border-amber-500/20 transition-all"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium flex items-center gap-1 flex-wrap">
                              {u.displayName}
                              {u.isFighter && <span className="text-red-500 text-sm font-bold">✓</span>}
                              {u.isVerified && <CheckCircle size={14} className="text-blue-400" />}
                              {u.isAdmin && <Shield size={14} className="text-amber-400" />}
                            </div>
                            <div className="text-gray-500 text-sm">@{u.username} · {u.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-400">{u.wins}W</span>
                          <span className="text-gray-600">/</span>
                          <span className="text-red-400">{u.losses}L</span>
                          {u.isFighter && <span className="ml-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Fighter</span>}
                          {u.isVerified && <span className="ml-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">Verified</span>}
                          {u.isBanned && <span className="ml-2 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Banned</span>}
                          {u.isRestricted && <span className="ml-2 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">Restricted</span>}
                        </div>
                      </motion.div>
                    ))}
                    {users.length === 0 && (
                      <div className="text-center text-gray-600 py-12">No users registered yet</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Verification */}
              {activeTab === 'verification' && (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-2 tracking-wider">VERIFICATION CENTER</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Two types of badges — you can give one or both to any user.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                      <div className="text-2xl font-['Bebas_Neue'] text-white">{users.filter(u => !u.isBanned).length}</div>
                      <div className="text-xs text-gray-500">Members</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                      <div className="text-2xl font-['Bebas_Neue'] text-blue-400">{users.filter(u => u.isVerified).length}</div>
                      <div className="text-xs text-gray-500">Blue Check (Verified)</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                      <div className="text-2xl font-['Bebas_Neue'] text-red-400">{users.filter(u => u.isFighter).length}</div>
                      <div className="text-xs text-gray-500">Red Check (Fighter)</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">All Users</h3>
                  <div className="space-y-2">
                    {users.filter(u => !u.isBanned).map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-xl flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium flex items-center gap-1 flex-wrap">
                              @{u.username}
                              {u.isFighter && <span className="text-red-500 text-sm font-bold" title="Fighter">✓</span>}
                              {u.isVerified && <span className="text-blue-400 text-sm" title="Verified">✓</span>}
                            </div>
                            <div className="text-gray-500 text-sm">{u.displayName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <motion.button
                            onClick={() => handleFighterToggle(u.username, u.isFighter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 ${
                              u.isFighter
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-red-500/10 hover:text-red-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {u.isFighter ? '✓ Red Check' : 'Add Red Check'}
                          </motion.button>
                          <motion.button
                            onClick={() => handleVerifyToggle(u.username, u.isVerified)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 ${
                              u.isVerified
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {u.isVerified ? '✓ Blue Check' : 'Add Blue Check'}
                          </motion.button>
                        </div>
                      </div>
                    ))}
                    {users.filter(u => !u.isBanned).length === 0 && (
                      <div className="text-center text-gray-600 py-12">No users registered yet</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Fight Requests */}
              {activeTab === 'requests' && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">FIGHT REQUESTS</h2>

                  {pendingRequests.length > 0 && (
                    <>
                      <h3 className="text-lg font-bold text-amber-400 mb-3">Pending</h3>
                      <div className="space-y-3 mb-8">
                        {pendingRequests.map(req => (
                          <motion.div
                            key={req.id}
                            className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-2 text-white">
                                <span className="font-bold text-amber-400">@{req.fromUsername}</span>
                                <ChevronRight size={16} className="text-gray-600" />
                                <Swords size={16} className="text-red-400" />
                                <ChevronRight size={16} className="text-gray-600" />
                                <span className="font-bold text-amber-400">@{req.toUsername}</span>
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => handleRequestAction(req.id, 'approved')}
                                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium cursor-pointer"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Approve
                                </motion.button>
                                <motion.button
                                  onClick={() => handleRequestAction(req.id, 'rejected')}
                                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium cursor-pointer"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Reject
                                </motion.button>
                              </div>
                            </div>
                            {req.message && (
                              <p className="text-gray-400 text-sm mt-2 italic">"{req.message}"</p>
                            )}
                            <p className="text-gray-600 text-xs mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}

                  <h3 className="text-lg font-bold text-gray-400 mb-3">All Requests</h3>
                  <div className="space-y-2">
                    {requests.map(req => (
                      <div key={req.id} className="p-3 bg-gray-800/30 border border-gray-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white">@{req.fromUsername}</span>
                          <span className="text-gray-600">vs</span>
                          <span className="text-white">@{req.toUsername}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                    {requests.length === 0 && (
                      <div className="text-center text-gray-600 py-12">No fight requests yet</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Schedule */}
              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">FIGHT SCHEDULES</h2>

                  <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-amber-400 mb-4">Create New Schedule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Fighter 1 Username"
                        value={scheduleForm.fighter1Username}
                        onChange={e => setScheduleForm(p => ({ ...p, fighter1Username: e.target.value }))}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Fighter 2 Username"
                        value={scheduleForm.fighter2Username}
                        onChange={e => setScheduleForm(p => ({ ...p, fighter2Username: e.target.value }))}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <input
                        type="date"
                        value={scheduleForm.date}
                        onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <input
                        type="time"
                        value={scheduleForm.time}
                        onChange={e => setScheduleForm(p => ({ ...p, time: e.target.value }))}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Venue"
                        value={scheduleForm.venue}
                        onChange={e => setScheduleForm(p => ({ ...p, venue: e.target.value }))}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <input
                        type="url"
                        placeholder="Image URL (optional)"
                        value={scheduleForm.image}
                        onChange={e => setScheduleForm(p => ({ ...p, image: e.target.value }))}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <textarea
                        placeholder="Fight description (optional)"
                        value={scheduleForm.description}
                        onChange={e => setScheduleForm(p => ({ ...p, description: e.target.value }))}
                        rows={3}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none sm:col-span-2"
                      />
                    </div>
                    <motion.button
                      onClick={handleCreateSchedule}
                      className="mt-4 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-red-600 text-white cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar size={16} /> Create Schedule
                      </span>
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {schedules.map(s => (
                      <div key={s.id} className="p-4 bg-gray-800/30 border border-gray-800 rounded-xl">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold">@{s.fighter1Username}</span>
                            <span className="text-amber-400 font-['Bebas_Neue'] text-lg">VS</span>
                            <span className="text-white font-bold">@{s.fighter2Username}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            s.status === 'upcoming' ? 'bg-amber-500/20 text-amber-400' :
                            s.status === 'ongoing' ? 'bg-green-500/20 text-green-500 animate-pulse' :
                            s.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="mt-2 flex gap-4 text-sm text-gray-500 flex-wrap">
                          <span>📅 {s.date}</span>
                          <span>⏰ {formatTime(s.time)}</span>
                          <span>📍 {s.venue}</span>
                        </div>
                        {s.description && (
                          <p className="mt-2 text-gray-400 text-sm">{s.description}</p>
                        )}
                        {s.image && (
                          <img src={s.image} alt="Fight" className="mt-2 rounded-lg max-h-48 object-cover" />
                        )}
                      </div>
                    ))}
                    {schedules.length === 0 && (
                      <div className="text-center text-gray-600 py-12">No schedules created yet</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Moderation */}
              {activeTab === 'moderation' && (
                <motion.div
                  key="moderation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">MODERATION</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                        <Ban size={18} /> Ban User
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Username to ban"
                          value={banUsername}
                          onChange={e => setBanUsername(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-all"
                        />
                        <motion.button
                          onClick={() => {
                            if (banUsername) { handleBan(banUsername); setBanUsername(''); }
                          }}
                          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Ban
                        </motion.button>
                      </div>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} /> Restrict User
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Username to restrict"
                          value={restrictUsername}
                          onChange={e => setRestrictUsername(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                        />
                        <motion.button
                          onClick={() => {
                            if (restrictUsername) { handleRestrict(restrictUsername); setRestrictUsername(''); }
                          }}
                          className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-medium cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Restrict
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4">User Moderation</h3>
                  <div className="space-y-3">
                    {users.filter(u => !u.isAdmin).map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-xl flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">@{u.username}</div>
                            <div className="flex gap-2 mt-1">
                              {u.isBanned && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Banned</span>}
                              {u.isRestricted && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Restricted</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {u.isBanned ? (
                            <motion.button
                              onClick={() => handleUnban(u.username)}
                              className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Unban
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleBan(u.username)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Ban
                            </motion.button>
                          )}
                          {u.isRestricted ? (
                            <motion.button
                              onClick={() => handleUnrestrict(u.username)}
                              className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Unrestrict
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleRestrict(u.username)}
                              className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Restrict
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Add Admin */}
              {activeTab === 'admins' && (
                <motion.div
                  key="admins"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">MANAGE ADMINS</h2>

                  {isSuper ? (
                    <>
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                          <UserPlus size={18} /> Promote User to Admin
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Enter the username of the person you want to make an admin.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Username"
                            value={adminUsername}
                            onChange={e => setAdminUsername(e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                          />
                          <motion.button
                            onClick={handleMakeAdmin}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Make Admin
                          </motion.button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 mb-8 text-center">
                      <Shield size={32} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">Only the super admin can add new admins.</p>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-white mb-4">Current Admins</h3>
                  <div className="space-y-2">
                    {users.filter(u => u.isAdmin).map(u => (
                      <div key={u.id} className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <Shield size={18} className="text-amber-400" />
                        <div>
                          <span className="text-white font-medium">@{u.username}</span>
                          <span className="text-gray-500 text-sm ml-2">{u.email}</span>
                          {isSuperAdminEmail(u.email) && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Super Admin</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Top Fighters */}
              {activeTab === 'top-fighters' && (
                <motion.div
                  key="top-fighters"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-2 tracking-wider">TOP FIGHTERS</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Add fighters to the top fighters list with a reason why they are featured.
                  </p>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <Star size={18} /> Add to Top Fighters
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Username"
                        value={topFighterUsername}
                        onChange={e => setTopFighterUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                      <textarea
                        placeholder="Why are they a top fighter?"
                        value={topFighterReason}
                        onChange={e => setTopFighterReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                      />
                      <motion.button
                        onClick={handleAddTopFighter}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Top Fighters
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4">Current Top Fighters</h3>
                  <div className="space-y-3">
                    {topFighters.map((tf, i) => (
                      <div key={i} className="flex items-start justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {tf.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-bold">@{tf.username}</div>
                            <p className="text-amber-400/80 text-sm mt-1 italic">"{tf.reason}"</p>
                            <p className="text-gray-600 text-xs mt-1">Added by @{tf.addedBy} · {new Date(tf.addedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => handleRemoveTopFighter(tf.username)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs cursor-pointer flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                    ))}
                    {topFighters.length === 0 && (
                      <div className="text-center text-gray-600 py-12">
                        <Star className="mx-auto mb-2" size={32} />
                        <p>No top fighters added yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tweets */}
              {activeTab === 'tweets' && (
                <motion.div
                  key="tweets"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-['Bebas_Neue'] text-white mb-6 tracking-wider">POST TWEET</h2>

                  {isSuper ? (
                    <>
                      <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 mb-8">
                        <textarea
                          placeholder="What's happening in ETFC? Share news, updates, announcements..."
                          value={tweetContent}
                          onChange={e => setTweetContent(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-gray-600 text-sm">{tweetContent.length}/500</span>
                          <motion.button
                            onClick={handleTweet}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="flex items-center gap-2">
                              <Send size={16} /> Post Tweet
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 mb-8 text-center">
                      <MessageSquare size={32} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">Only the super admin can post tweets.</p>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-white mb-4">All Tweets</h3>
                  <div className="space-y-3">
                    {getTweets().map(t => (
                      <div key={t.id} className="p-4 bg-gray-800/30 border border-gray-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-amber-400 font-bold">@{t.authorUsername}</span>
                          <span className="text-gray-600 text-xs">{new Date(t.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-300">{t.content}</p>
                        <div className="mt-2 text-sm text-gray-600">❤️ {t.likes}</div>
                      </div>
                    ))}
                    {getTweets().length === 0 && (
                      <div className="text-center text-gray-600 py-12">No tweets posted yet</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
