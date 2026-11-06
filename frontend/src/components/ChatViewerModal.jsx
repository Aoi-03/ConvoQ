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
    <div className="fixed inset-0 z-50 bg-[#150e0f]/50 backdrop-blur-sm flex items-center justify-center p-4 text-[#150e0f]">
      <div className="bg-[#ffffff] border border-[#e8dfe2] rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-[#e8dfe2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f4ecee] border border-[#9b6d77]/30 flex items-center justify-center text-[#9b6d77]">
              {chat.chat_type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#150e0f]">{chat.name}</h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  chat.chat_type === 'group'
                    ? 'bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/30'
                    : 'bg-[#edf4f2] text-[#3a6357] border border-[#87ada2]/40'
                }`}>
                  {chat.chat_type === 'group' ? 'Group Chat' : '1:1 Personal'}
                </span>
              </div>
              <p className="text-xs text-[#5e4f53]">
                {chat.total_messages} messages recorded • {chat.total_media} media items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#826f74] hover:text-[#150e0f] rounded-lg hover:bg-[#f4ecee] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-[#e8dfe2] bg-[#fcfafb] flex items-center gap-2">
          <Search className="w-4 h-4 text-[#826f74]" />
          <input
            type="text"
            placeholder="Search messages or senders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#150e0f] placeholder-[#826f74] focus:outline-none"
          />
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfafb]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6f5e63] animate-pulse">
              Loading chat messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#826f74]">
              No messages found matching search.
            </div>
          ) : (
            filteredMessages.map((m) => {
              if (m.is_system) {
                return (
                  <div key={m.id} className="text-center my-2">
                    <span className="text-[11px] text-[#5e4f53] px-3 py-1 rounded-full bg-[#f4ecee] border border-[#ebdada]">
                      🔒 {m.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={m.id} className="p-3 rounded-xl bg-[#ffffff] border border-[#e8dfe2] shadow-sm hover:border-[#9b6d77]/40 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#9b6d77]">{m.sender}</span>
                    <span className="text-[10px] text-[#826f74] flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {m.timestamp}
                    </span>
                  </div>

                  {m.media_type !== 'none' && (
                    <div className="mb-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#edf4f2] border border-[#87ada2]/40 text-[11px] text-[#3a6357] font-semibold">
                      {m.media_type === 'audio' && <Mic className="w-3 h-3 text-[#9b6d77]" />}
                      {m.media_type === 'image' && <Image className="w-3 h-3 text-[#87ada2]" />}
                      {m.media_type === 'video' && <Video className="w-3 h-3 text-[#b1cab2]" />}
                      {m.media_type === 'document' && <FileText className="w-3 h-3 text-[#826f74]" />}
                      <span>{m.media_summary || `[${m.media_type.toUpperCase()} ATTACHMENT]`}</span>
                    </div>
                  )}

                  <p className="text-xs text-[#150e0f] whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
