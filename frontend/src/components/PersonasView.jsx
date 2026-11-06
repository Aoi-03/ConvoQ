import React, { useState } from 'react';
import { User, Sparkles, Mic, Image, Moon, MessageSquare, Flame, Check } from 'lucide-react';

export default function PersonasView({ personas = [], onRoastParticipant, onCloneParticipant }) {
  const [selectedPersona, setSelectedPersona] = useState(null);

  if (personas.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        <User className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
        No participant personas generated yet. Ingest a chat export or load the demo scenario.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Participant Personas
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {personas.length} Modeled Profiles
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Psychometric and stylometric profiles computed from communication habits, latency, humor, and group roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => {
          const stats = p.activity_patterns || {};
          return (
            <div
              key={p.id || p.name}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-cyan-900/30">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                        {p.name}
                      </h3>
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {p.group_role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Communication style */}
                <p className="text-[11px] text-slate-300 line-clamp-2 italic mb-2">
                  "{p.communication_style}"
                </p>

                {/* Emojis Fingerprint */}
                {p.emoji_fingerprint?.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Emoji DNA:</span>
                    <span className="text-sm tracking-widest">{p.emoji_fingerprint.join(' ')}</span>
                  </div>
                )}

                {/* Quirks */}
                {p.quirks?.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" /> Signature Quirk
                    </span>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{p.quirks[0]}</p>
                  </div>
                )}

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-1 py-1 text-center bg-slate-800/40 rounded-xl text-[10px] text-slate-400 border border-slate-800">
                  <div className="p-1">
                    <span className="block font-bold text-slate-200">{stats.total_messages || 0}</span>
                    <span>Msgs</span>
                  </div>
                  <div className="p-1 border-x border-slate-800">
                    <span className="block font-bold text-cyan-300 flex items-center justify-center gap-0.5">
                      <Mic className="w-2.5 h-2.5" />
                      {stats.voice_notes_sent || 0}
                    </span>
                    <span>Audios</span>
                  </div>
                  <div className="p-1">
                    <span className="block font-bold text-emerald-300 flex items-center justify-center gap-0.5">
                      <Image className="w-2.5 h-2.5" />
                      {stats.images_shared || 0}
                    </span>
                    <span>Media</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onRoastParticipant(p.name)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Roast</span>
                </button>
                <button
                  onClick={() => onCloneParticipant(p.name)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mimic</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
