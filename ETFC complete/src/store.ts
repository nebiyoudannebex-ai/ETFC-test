// Simple state management using localStorage
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  googleId: string;
  displayName: string;
  avatar: string;
  bio: string;
  wins: number;
  losses: number;
  isVerified: boolean;   // blue check — identity verified
  isFighter: boolean;     // red check — approved to fight
  isBanned: boolean;
  isRestricted: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export interface FightRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FightSchedule {
  id: string;
  fighter1Username: string;
  fighter2Username: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  winner?: string;
  description: string;
  image: string;
  createdAt: string;
}

export interface TweetReply {
  id: string;
  tweetId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface Tweet {
  id: string;
  authorUsername: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];  // list of usernames who liked
}

export interface TopFighter {
  username: string;
  reason: string;
  addedBy: string;
  addedAt: string;
}

const ADMIN_EMAIL = 'nebiyou1daniel@gmail.com';

export function isSuperAdmin(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
export function getUsers(): User[] {
  return getFromStorage<User[]>('etfc_users', []);
}

export function saveUsers(users: User[]): void {
  setToStorage('etfc_users', users);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserByGoogleId(googleId: string): User | undefined {
  return getUsers().find(u => u.googleId === googleId);
}

// Simple password hashing (base64 encode + salt for localStorage demo)
function hashPassword(password: string): string {
  const salt = 'etfc_salt_2024';
  return btoa(salt + password + salt);
}

export function verifyPassword(user: User, password: string): boolean {
  return user.password === hashPassword(password);
}

export function registerUser(
  username: string,
  email: string,
  password: string,
  displayName: string,
  googleId: string = ''
): User {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already taken. Please choose another.');
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('This email is already registered. Please use a different email or login instead.');
  }

  const avatarColors = ['F59E0B', 'EF4444', '3B82F6', '10B981', '8B5CF6', 'EC4899', 'F97316'];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const user: User = {
    id: generateId(),
    username,
    email,
    password: password ? hashPassword(password) : '',
    googleId,
    displayName,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${randomColor}&color=fff&size=128`,
    bio: '',
    wins: 0,
    losses: 0,
    isVerified: false,
    isFighter: false,
    isBanned: false,
    isRestricted: false,
    isAdmin: email.toLowerCase() === ADMIN_EMAIL,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUser(userId: string, updates: Partial<User>): User | undefined {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

// Current session
export function getCurrentUser(): User | null {
  const userId = localStorage.getItem('etfc_current_user');
  if (!userId) return null;
  return getUserById(userId) || null;
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem('etfc_current_user', userId);
}

export function logout(): void {
  localStorage.removeItem('etfc_current_user');
}

// Fight Requests
export function getFightRequests(): FightRequest[] {
  return getFromStorage<FightRequest[]>('etfc_fight_requests', []);
}

export function saveFightRequests(requests: FightRequest[]): void {
  setToStorage('etfc_fight_requests', requests);
}

export function createFightRequest(fromUser: User, toUsername: string, message: string): FightRequest {
  const requests = getFightRequests();

  if (!fromUser.isFighter) {
    throw new Error('Only approved fighters can send fight requests. Contact an admin to get fighter status.');
  }

  const toUser = getUserByUsername(toUsername);
  if (!toUser) throw new Error('User not found');
  if (toUser.id === fromUser.id) throw new Error('You cannot fight yourself');

  if (!toUser.isFighter) {
    throw new Error('That user is not yet an approved fighter. The admin needs to approve them first.');
  }

  const existing = requests.find(
    r => r.status === 'pending' && r.fromUserId === fromUser.id && r.toUserId === toUser.id
  );
  if (existing) throw new Error('You already have a pending request to this user');

  const request: FightRequest = {
    id: generateId(),
    fromUserId: fromUser.id,
    fromUsername: fromUser.username,
    toUserId: toUser.id,
    toUsername: toUser.username,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  requests.push(request);
  saveFightRequests(requests);
  return request;
}

export function updateFightRequest(requestId: string, status: 'approved' | 'rejected'): void {
  const requests = getFightRequests();
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx !== -1) {
    requests[idx].status = status;
    saveFightRequests(requests);
  }
}

// Fight Schedules
export function getFightSchedules(): FightSchedule[] {
  return getFromStorage<FightSchedule[]>('etfc_fight_schedules', []);
}

export function saveFightSchedules(schedules: FightSchedule[]): void {
  setToStorage('etfc_fight_schedules', schedules);
}

export function createFightSchedule(schedule: Omit<FightSchedule, 'id' | 'createdAt'>): FightSchedule {
  const schedules = getFightSchedules();
  const newSchedule: FightSchedule = {
    ...schedule,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  schedules.push(newSchedule);
  saveFightSchedules(schedules);
  return newSchedule;
}

export function updateFightSchedule(scheduleId: string, updates: Partial<FightSchedule>): void {
  const schedules = getFightSchedules();
  const idx = schedules.findIndex(s => s.id === scheduleId);
  if (idx !== -1) {
    schedules[idx] = { ...schedules[idx], ...updates };
    saveFightSchedules(schedules);
  }
}

// Tweet Replies
export function getTweetReplies(): TweetReply[] {
  return getFromStorage<TweetReply[]>('etfc_tweet_replies', []);
}

export function saveTweetReplies(replies: TweetReply[]): void {
  setToStorage('etfc_tweet_replies', replies);
}

export function createTweetReply(authorUsername: string, tweetId: string, content: string): TweetReply {
  const replies = getTweetReplies();
  const reply: TweetReply = {
    id: generateId(),
    tweetId,
    authorUsername,
    content,
    createdAt: new Date().toISOString(),
  };
  replies.push(reply);
  saveTweetReplies(replies);
  return reply;
}

// Tweets
export function getTweets(): Tweet[] {
  return getFromStorage<Tweet[]>('etfc_tweets', []);
}

export function saveTweets(tweets: Tweet[]): void {
  setToStorage('etfc_tweets', tweets);
}

export function createTweet(authorUsername: string, content: string): Tweet {
  const tweets = getTweets();
  const tweet: Tweet = {
    id: generateId(),
    authorUsername,
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  };
  tweets.unshift(tweet);
  saveTweets(tweets);
  return tweet;
}

export function likeTweet(tweetId: string, username: string): void {
  const tweets = getTweets();
  const idx = tweets.findIndex(t => t.id === tweetId);
  if (idx !== -1) {
    const tweet = tweets[idx];
    if (!tweet.likedBy.includes(username)) {
      tweet.likedBy.push(username);
      tweet.likes = tweet.likedBy.length;
      saveTweets(tweets);
    }
  }
}

// Top Fighters
export function getTopFighters(): TopFighter[] {
  return getFromStorage<TopFighter[]>('etfc_top_fighters', []);
}

export function saveTopFighters(list: TopFighter[]): void {
  setToStorage('etfc_top_fighters', list);
}

export function addTopFighter(username: string, reason: string, addedBy: string): TopFighter {
  const list = getTopFighters();
  const entry: TopFighter = {
    username,
    reason,
    addedBy,
    addedAt: new Date().toISOString(),
  };
  list.push(entry);
  saveTopFighters(list);
  return entry;
}

export function removeTopFighter(username: string): void {
  let list = getTopFighters();
  list = list.filter(t => t.username.toLowerCase() !== username.toLowerCase());
  saveTopFighters(list);
}

export function isSuperAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL;
}

// Make admin by username
export function makeAdmin(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isAdmin = true;
  saveUsers(users);
  return true;
}

// Ban user
export function banUser(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isBanned = true;
  saveUsers(users);
  return true;
}

// Restrict user
export function restrictUser(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isRestricted = true;
  saveUsers(users);
  return true;
}

// Unban user
export function unbanUser(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isBanned = false;
  saveUsers(users);
  return true;
}

// Unrestrict user
export function unrestrictUser(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isRestricted = false;
  saveUsers(users);
  return true;
}

// Verify user (blue check — identity verified)
export function verifyUser(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isVerified = true;
  saveUsers(users);
  return true;
}

// Unverify user
export function unverifyUser(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isVerified = false;
  saveUsers(users);
  return true;
}

// Approve as fighter (red check — can send/receive fights)
export function makeFighter(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isFighter = true;
  saveUsers(users);
  return true;
}

// Remove fighter status
export function removeFighter(username: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  users[idx].isFighter = false;
  saveUsers(users);
  return true;
}

// Format time to 12-hour
export function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
