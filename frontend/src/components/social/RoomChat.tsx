import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../../types';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

interface RoomChatProps {
  roomCode: string;
  initialMessages?: ChatMessage[];
}

const QUICK_EMOJIS = ['🍿', '🎬', '😱', '😂', '❤️', '🔥', '👏', '🚀'];

export const RoomChat: React.FC<RoomChatProps> = ({ roomCode, initialMessages = [] }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const socket = getSocket();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!text.trim() || !user) return;

    socket.emit('send_message', {
      roomCode,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      content: text.trim(),
      type: 'CHAT',
    });

    setText('');
  };

  const handleSendReaction = (emoji: string) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!user) return;

    socket.emit('send_message', {
      roomCode,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      content: emoji,
      type: 'REACTION',
    });
  };

  return (
    <div className="glass-panel rounded-3xl border border-cinemate-border/70 flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cinemate-accent" />
          <h4 className="font-bold text-sm text-white">Live Watch Party Chat</h4>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">#{roomCode}</span>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => {
          const isReaction = m.type === 'REACTION';
          const isMe = user && m.userId === user.id;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={m.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.user?.username || 'viewer'}`}
                alt={m.user?.username || 'viewer'}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-800 flex-shrink-0"
              />

              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                <span className="text-[10px] text-slate-400 font-medium mb-0.5">
                  {m.user?.username || 'Viewer'}
                </span>

                {isReaction ? (
                  <div className="text-3xl p-1 animate-bounce">{m.content}</div>
                ) : (
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-cinemate-accent text-white rounded-tr-none shadow-md shadow-cinemate-accent/20'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Bar */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Smile className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSendReaction(emoji)}
            className="p-1 hover:scale-125 transition-transform text-base"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isAuthenticated ? 'Type a message to the room...' : 'Sign in to chat...'}
          disabled={!isAuthenticated}
          className="flex-1 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cinemate-accent"
        />
        <button
          type="submit"
          disabled={!isAuthenticated || !text.trim()}
          className="p-2.5 rounded-xl bg-cinemate-accent hover:bg-purple-600 text-white disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
