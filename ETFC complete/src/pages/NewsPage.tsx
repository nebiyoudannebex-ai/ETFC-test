import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTweets, likeTweet, getTweetReplies, createTweetReply, type Tweet, type User } from '../store';
import { MessageSquare, Heart, Clock, Send } from 'lucide-react';

interface NewsPageProps {
  currentUser: User | null;
}

export default function NewsPage({ currentUser }: NewsPageProps) {
  const [tweets, setTweets] = useState<Tweet[]>(getTweets());
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  const handleLike = (tweetId: string) => {
    if (!currentUser) return;
    likeTweet(tweetId, currentUser.username);
    setTweets(getTweets());
  };

  const handleReply = (tweetId: string) => {
    if (!currentUser || !replyText[tweetId]?.trim()) return;
    createTweetReply(currentUser.username, tweetId, replyText[tweetId]);
    setReplyText(p => ({ ...p, [tweetId]: '' }));
    // Force re-render to show new reply
    setTweets(getTweets());
  };

  const allReplies = getTweetReplies();

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-['Bebas_Neue'] text-white tracking-wider flex items-center justify-center gap-3">
            <MessageSquare className="text-amber-400" size={40} />
            NEWS & <span className="text-amber-400">UPDATES</span>
          </h1>
          <p className="text-gray-500 mt-2">Stay updated with the latest from ETFC</p>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {tweets.map((tweet) => {
            const tweetReplies = allReplies.filter(r => r.tweetId === tweet.id);
            const hasLiked = currentUser && tweet.likedBy?.includes(currentUser.username);

            return (
              <motion.div
                key={tweet.id}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0 },
                }}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    {tweet.authorUsername.charAt(0).toUpperCase()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">@{tweet.authorUsername}</span>
                      <span className="text-amber-400 text-sm">✓</span>
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(tweet.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{tweet.content}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <motion.button
                        onClick={() => handleLike(tweet.id)}
                        disabled={!currentUser || !!hasLiked}
                        className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
                        }`}
                        whileTap={currentUser && !hasLiked ? { scale: 0.9 } : {}}
                      >
                        <Heart size={16} className={hasLiked ? 'fill-red-400' : ''} />
                        <span>{tweet.likes}</span>
                      </motion.button>
                      <button
                        onClick={() => setShowReplies(p => ({ ...p, [tweet.id]: !p[tweet.id] }))}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <MessageSquare size={16} />
                        <span>{tweetReplies.length}</span>
                      </button>
                    </div>

                    {/* Reply input */}
                    {currentUser && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyText[tweet.id] || ''}
                          onChange={e => setReplyText(p => ({ ...p, [tweet.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleReply(tweet.id)}
                          className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                        <motion.button
                          onClick={() => handleReply(tweet.id)}
                          className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Send size={14} />
                        </motion.button>
                      </div>
                    )}

                    {/* Replies */}
                    <AnimatePresence>
                      {showReplies[tweet.id] && tweetReplies.length > 0 && (
                        <motion.div
                          className="mt-3 space-y-2 pl-4 border-l-2 border-gray-800"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          {tweetReplies.map(reply => (
                            <div key={reply.id} className="p-2 bg-gray-800/30 rounded-lg">
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-amber-400 font-medium">@{reply.authorUsername}</span>
                                <span className="text-gray-600">
                                  {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mt-0.5">{reply.content}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {tweets.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MessageSquare className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No news posted yet</p>
            <p className="text-gray-700 text-sm mt-2">Check back later for updates from ETFC admins!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
