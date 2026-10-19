import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, UserPlus, Check, X, Video } from 'lucide-react';
import { Friend, FriendRequest, User as UserType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FriendsPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  const loadFriendsData = async () => {
    if (!isAuthenticated) return;
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.getFriends(),
        api.getFriendRequests(),
      ]);

      if (friendsRes.success) setFriends(friendsRes.data);
      if (requestsRes.success) setIncoming(requestsRes.incoming);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, [isAuthenticated]);

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.searchUsers(searchQuery.trim());
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error('User search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      await api.sendFriendRequest(targetUserId);
      setSentSuccessId(targetUserId);
      setTimeout(() => setSentSuccessId(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Could not send friend request.');
    }
  };

  const handleRespondRequest = async (id: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      await api.respondFriendRequest(id, action);
      await loadFriendsData();
    } catch (err) {
      console.error('Respond request error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cinemate-cyan/10 border border-cinemate-cyan/30 flex items-center justify-center mx-auto text-cinemate-cyan">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Social Viewing & Friends</h2>
        <p className="text-xs text-slate-400">
          Connect with other movie buffs, check out what they're watching, and host synchronized watch parties.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/30 transition-all"
        >
          Sign In to Access Social Features
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-cinemate-cyan" />
          <span>Friends & Film Community</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Share reviews, recommend titles, and watch movies together
        </p>
      </div>

      {/* Search for users */}
      <div className="glass-panel p-6 rounded-3xl border border-cinemate-border/70 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-cinemate-accent" />
          <span>Find CineMate Viewers</span>
        </h3>

        <form onSubmit={handleSearchUsers} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username (e.g. sophia, alex)..."
              className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cinemate-accent"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white transition-all"
          >
            {isSearching ? 'Searching...' : 'Find'}
          </button>
        </form>

        {/* User Search Results */}
        {searchResults.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {searchResults.map((u) => {
              const isAlreadyFriend = friends.some((f) => f.user.id === u.id);
              return (
                <div
                  key={u.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{u.username}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{u.bio || 'Film fan'}</p>
                    </div>
                  </div>

                  {isAlreadyFriend ? (
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                      Friends
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(u.id)}
                      disabled={sentSuccessId === u.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white transition-all disabled:bg-emerald-600"
                    >
                      {sentSuccessId === u.id ? 'Sent ✓' : 'Add Friend'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Incoming Requests */}
      {incoming.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-cinemate-accent/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cinemate-accent animate-pulse" />
            <span>Incoming Friend Requests ({incoming.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={req.sender?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.sender?.username}`}
                    alt={req.sender?.username}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">@{req.sender?.username}</p>
                    <p className="text-[10px] text-slate-400">Wants to be viewing buddies</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespondRequest(req.id, 'DECLINE')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-white">
          Friends ({friends.length})
        </h3>

        {friends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {friends.map((f) => (
              <div
                key={f.friendshipId}
                className="glass-panel p-4 rounded-2xl border border-cinemate-border/70 flex items-center justify-between hover:border-cinemate-accent/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={f.user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.user.username}`}
                    alt={f.user.username}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-cinemate-accent/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">@{f.user.username}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[120px]">{f.user.bio || 'Movie lover'}</p>
                    <span className="text-[9px] text-slate-500">Region: {f.user.preferredRegion || 'US'}</span>
                  </div>
                </div>

                <Link
                  to={`/rooms`}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-cinemate-accent hover:text-white text-slate-400 transition-all"
                  title="Invite to Watch Party"
                >
                  <Video className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-2 max-w-md mx-auto">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No friends added yet</h4>
            <p className="text-xs text-slate-400">
              Search for friends above (e.g., search for 'alex' or 'sophia') to start sharing movies!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
