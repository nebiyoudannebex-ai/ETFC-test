import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { updateUser, type User } from '../store';
import { User as UserIcon, Edit3, Save, Shield, CheckCircle, Trophy, Swords, AlertTriangle, Camera } from 'lucide-react';

export default function ProfilePage({ currentUser, onUserUpdate }: { currentUser: User; onUserUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateUser(currentUser.id, { displayName, bio, avatar });
    onUserUpdate();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          {/* Profile content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-between items-start -mt-10">
              <div className="relative group">
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-gray-900 shadow-lg overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                >
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.div>
                {editing && (
                  <button
                    onClick={triggerFileInput}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 border-2 border-gray-900 flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors"
                  >
                    <Camera size={14} className="text-white" />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <motion.button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className={`mt-12 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2 ${
                  editing
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-amber-500/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {editing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit Profile</>}
              </motion.button>
            </div>

            {/* Info */}
            <div className="mt-4">
              {editing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="text-2xl font-bold bg-transparent text-white border-b border-amber-500/30 focus:outline-none w-full mb-1"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {currentUser.displayName}
                  {currentUser.isFighter && <span className="text-red-500 text-lg font-bold" title="Fighter">✓</span>}
                  {currentUser.isVerified && <CheckCircle size={18} className="text-blue-400" />}
                  {currentUser.isAdmin && <Shield size={18} className="text-amber-400" />}
                </h2>
              )}
              <p className="text-gray-500">@{currentUser.username}</p>
              <p className="text-gray-600 text-sm">{currentUser.email}</p>

              {/* Status badges */}
              <div className="flex gap-2 mt-3">
                {currentUser.isFighter && (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium flex items-center gap-1">
                    <span className="font-bold">✓</span> Fighter
                  </span>
                )}
                {currentUser.isVerified && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={12} /> Verified
                  </span>
                )}
                {currentUser.isAdmin && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium flex items-center gap-1">
                    <Shield size={12} /> Admin
                  </span>
                )}
                {currentUser.isRestricted && (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> Restricted
                  </span>
                )}
              </div>

              {/* Bio */}
              <div className="mt-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Bio</h3>
                {editing ? (
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  />
                ) : (
                  <p className="text-gray-400">{currentUser.bio || 'No bio yet.'}</p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <motion.div
                  className="bg-green-500/10 rounded-xl p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Trophy size={20} className="text-green-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-400">{currentUser.wins}</div>
                  <div className="text-gray-500 text-xs">Wins</div>
                </motion.div>
                <motion.div
                  className="bg-red-500/10 rounded-xl p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Swords size={20} className="text-red-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-red-400">{currentUser.losses}</div>
                  <div className="text-gray-500 text-xs">Losses</div>
                </motion.div>
                <motion.div
                  className="bg-amber-500/10 rounded-xl p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <UserIcon size={20} className="text-amber-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-amber-400">
                    {currentUser.wins + currentUser.losses > 0
                      ? Math.round((currentUser.wins / (currentUser.wins + currentUser.losses)) * 100)
                      : 0}%
                  </div>
                  <div className="text-gray-500 text-xs">Win Rate</div>
                </motion.div>
              </div>

              {/* Member since */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Member since {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {saved && (
          <motion.div
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Profile updated successfully!
          </motion.div>
        )}
      </div>
    </div>
  );
}
