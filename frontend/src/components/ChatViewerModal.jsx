import React, { useState, useEffect } from 'react';
import { X, Search, Mic, Image, Video, FileText, Users, User, Clock } from 'lucide-react';
import { api } from '../api/client';

export default function ChatViewerModal({ isOpen, onClose, projectId, chat }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen && chat) {
      setLoading(true);
      api.getChatMessages(projectId, chat.id, 200, 0)
        .then((data) => {
          setMessages(data.messages || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, chat, projectId]);

  if (!isOpen || !chat) return null;

  const filteredMessages = messages.filter((m) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      m.sender.toLowerCase().includes(term) ||
      m.content.toLowerCase().includes(term) ||
      (m.media_summary && m.media_summary.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              {chat.chat_type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{chat.name}</h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  chat.chat_type === 'group'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {chat.chat_type === 'group' ? 'Group Chat' : '1:1 Personal'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {chat.total_messages} messages recorded • {chat.total_media} media items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search messages or senders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading chat messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No messages found matching search.
            </div>
          ) : (
            filteredMessages.map((m) => {
              if (m.is_system) {
                return (
                  <div key={m.id} className="text-center my-2">
                    <span className="text-[11px] text-slate-400 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
                      🔒 {m.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={m.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-cyan-300">{m.sender}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {m.timestamp}
                    </span>
                  </div>

                  {m.media_type !== 'none' && (
                    <div className="mb-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/50 text-[11px] text-cyan-300 font-medium">
                      {m.media_type === 'audio' && <Mic className="w-3 h-3 text-cyan-400" />}
                      {m.media_type === 'image' && <Image className="w-3 h-3 text-emerald-400" />}
                      {m.media_type === 'video' && <Video className="w-3 h-3 text-indigo-400" />}
                      {m.media_type === 'document' && <FileText className="w-3 h-3 text-amber-400" />}
                      <span>{m.media_summary || `[${m.media_type.toUpperCase()} ATTACHMENT]`}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
