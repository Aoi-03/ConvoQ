import React, { useState } from 'react';
import { User, Sparkles, Mic, Image, Flame, MessageSquare } from 'lucide-react';

export default function PersonasView({ personas = [], onRoastParticipant, onCloneParticipant }) {
  if (personas.length === 0) {
    return (
      <div className="py-20 text-center text-[#826f74] text-xs">
        <User className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#9b6d77]" />
        No participant personas generated yet. Ingest a chat export or load the demo scenario.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[#150e0f]">
      <div className="flex items-center justify-between pb-2 border-b border-[#e8dfe2]">
        <div>
          <h2 className="text-sm font-bold text-[#150e0f] flex items-center gap-2">
            Participant Personas
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/25">
              {personas.length} Modeled Profiles
            </span>
          </h2>
          <p className="text-xs text-[#5e4f53]">
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
              className="p-4 rounded-2xl bg-[#ffffff] border border-[#e8dfe2] hover:border-[#9b6d77]/40 shadow-sm transition flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9b6d77] to-[#87ada2] flex items-center justify-center font-bold text-sm text-white shadow-md shadow-[#9b6d77]/20">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#150e0f] group-hover:text-[#9b6d77] transition">
                        {p.name}
                      </h3>
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/20">
                        {p.group_role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Communication style */}
                <p className="text-[11px] text-[#5e4f53] line-clamp-2 italic mb-2">
                  "{p.communication_style}"
                </p>

                {/* Emojis Fingerprint */}
                {p.emoji_fingerprint?.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-[#826f74] uppercase font-bold">Emoji DNA:</span>
                    <span className="text-sm tracking-widest">{p.emoji_fingerprint.join(' ')}</span>
                  </div>
                )}

                {/* Quirks */}
                {p.quirks?.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#fcfafb] border border-[#ded1d5] mb-2">
                    <span className="text-[10px] font-bold text-[#9b6d77] uppercase flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" /> Signature Quirk
                    </span>
                    <p className="text-[11px] text-[#4d3f43] line-clamp-2">{p.quirks[0]}</p>
                  </div>
                )}

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-1 py-1 text-center bg-[#fcfafb] rounded-xl text-[10px] text-[#6f5e63] border border-[#e8dfe2]">
                  <div className="p-1">
                    <span className="block font-bold text-[#150e0f]">{stats.total_messages || 0}</span>
                    <span>Msgs</span>
                  </div>
                  <div className="p-1 border-x border-[#e8dfe2]">
                    <span className="block font-bold text-[#9b6d77] flex items-center justify-center gap-0.5">
                      <Mic className="w-2.5 h-2.5" />
                      {stats.voice_notes_sent || 0}
                    </span>
                    <span>Audios</span>
                  </div>
                  <div className="p-1">
                    <span className="block font-bold text-[#3a6357] flex items-center justify-center gap-0.5">
                      <Image className="w-2.5 h-2.5" />
                      {stats.images_shared || 0}
                    </span>
                    <span>Media</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#e8dfe2] flex items-center justify-between gap-2">
                <button
                  onClick={() => onRoastParticipant(p.name)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ecee] hover:bg-[#ebdada] text-[#9b6d77] border border-[#9b6d77]/30 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#9b6d77]" />
                  <span>Roast</span>
                </button>
                <button
                  onClick={() => onCloneParticipant(p.name)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#edf4f2] hover:bg-[#deede9] text-[#3a6357] border border-[#87ada2]/40 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#87ada2]" />
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
