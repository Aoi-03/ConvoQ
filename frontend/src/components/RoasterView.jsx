import React, { useState } from 'react';
import { Flame, ShieldCheck, Sparkles, Send, Quote, ArrowRight, User } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';

export default function RoasterView({
  onRoast,
  loading,
  lastResponse,
  onOpenCitation,
  participants = []
}) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(participants[0]?.name || '');
  const [intensity, setIntensity] = useState('savage');

  const sampleRoasts = [
    { label: "Voice-Note Obsession", prompt: `Roast ${target || 'Shrimant'} based on their voice-note habits` },
    { label: "Perpetual Goa Trip Delays", prompt: "Roast our group for endlessly planning and postponing trips" },
    { label: "Typing & Ghosting Habits", prompt: `Roast ${target || 'our friend'} for leaving messages on read for 14 hours` },
  ];

  const handleRoastSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() && !target) return;
    const finalQuery = query.trim() || `Roast ${target} based on their chat quirks and habits`;
    onRoast(finalQuery, target, intensity);
  };

  const handleSampleClick = (prompt) => {
    setQuery(prompt);
    onRoast(prompt, target, intensity);
  };

  return (
    <div className="flex flex-col space-y-4 text-[#150e0f] pb-8">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f4ecee] via-[#ffffff] to-[#edf4f2] border border-[#e8dfe2] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9b6d77] to-[#87ada2] flex items-center justify-center text-white shadow-md shadow-[#9b6d77]/20">
            <Flame className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#150e0f] flex items-center gap-2">
              The Roaster Agent
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/25 uppercase">
                Grounded Comedy
              </span>
            </h2>
            <p className="text-xs text-[#5e4f53]">
              Generates hilarious, personalized roasts strictly grounded in actual conversation habits, voice notes, and chat quirks.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf2eb] text-[#38663b] border border-[#b1cab2]/60 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safe & Playful Guardrails Active</span>
        </div>
      </div>

      {/* Target & Intensity Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Target Participant */}
        <div className="p-3 rounded-xl bg-[#ffffff] border border-[#e8dfe2] shadow-sm">
          <label className="block text-[11px] font-bold text-[#6f5e63] uppercase mb-1.5 flex items-center gap-1">
            <User className="w-3 h-3 text-[#9b6d77]" />
            Target Participant
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-[#fcfafb] border border-[#ded1d5] text-[#150e0f] text-xs focus:outline-none focus:border-[#9b6d77]"
          >
            <option value="">-- Entire Group / Anyone --</option>
            {participants.map((p) => (
              <option key={p.id || p.name} value={p.name}>
                {p.name} ({p.message_count || 0} msgs, {p.voice_note_count || 0} audios)
              </option>
            ))}
          </select>
        </div>

        {/* Intensity Level */}
        <div className="p-3 rounded-xl bg-[#ffffff] border border-[#e8dfe2] shadow-sm">
          <label className="block text-[11px] font-bold text-[#6f5e63] uppercase mb-1.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#9b6d77]" />
            Roast Intensity Slider
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'mild', label: 'Mild 🍵', desc: 'Friendly tease' },
              { id: 'savage', label: 'Savage 🔥', desc: 'Sharp wit' },
              { id: 'brutal', label: 'Brutal 💀', desc: 'High voltage' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setIntensity(lvl.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  intensity === lvl.id
                    ? 'bg-[#9b6d77] text-white border-[#9b6d77] shadow-sm'
                    : 'bg-[#fcfafb] text-[#5e4f53] border-[#ded1d5] hover:text-[#150e0f] hover:bg-[#f4ecee]'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Quick Roasts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#6f5e63] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#9b6d77]" />
          Quick Comedic Angles
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleRoasts.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSampleClick(r.prompt)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#ffffff] hover:bg-[#f4ecee] text-[#4d3f43] hover:text-[#150e0f] border border-[#ded1d5] hover:border-[#9b6d77]/50 shadow-sm transition flex items-center gap-1.5 group cursor-pointer"
            >
              <span>{r.label}</span>
              <ArrowRight className="w-3 h-3 text-[#826f74] group-hover:text-[#9b6d77] transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Roast Input */}
      <form onSubmit={handleRoastSubmit} className="relative">
        <input
          type="text"
          placeholder={`Give custom instructions or roast ${target || 'a friend'}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl bg-[#ffffff] border border-[#ded1d5] text-[#150e0f] text-sm focus:outline-none focus:border-[#9b6d77] pr-12 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] disabled:opacity-40 text-white transition shadow-md shadow-[#9b6d77]/20 cursor-pointer"
          title="Fire Roast"
        >
          <Flame className="w-4 h-4" />
        </button>
      </form>

      {/* Response Box */}
      <div className="w-full p-5 md:p-6 rounded-2xl bg-[#ffffff] border border-[#e8dfe2] shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#6f5e63] space-y-3">
            <div className="w-8 h-8 border-2 border-[#9b6d77] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Gathering texting quirks, voice notes evidence, and calculating comedy burns...</p>
          </div>
        ) : lastResponse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8dfe2]">
              <span className="text-xs font-bold text-[#5e4f53] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#9b6d77]" />
                Roaster Stage
              </span>
              {lastResponse.citations?.length > 0 && (
                <button
                  onClick={() => onOpenCitation()}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#f4ecee] hover:bg-[#ebdada] text-[#9b6d77] border border-[#9b6d77]/30 flex items-center gap-1.5 font-semibold transition cursor-pointer"
                >
                  <Quote className="w-3 h-3" />
                  <span>{lastResponse.citations.length} Verified Evidence Cards</span>
                </button>
              )}
            </div>

            {/* Rendered Markdown Output */}
            <MarkdownViewer content={lastResponse.answer} onOpenCitation={onOpenCitation} />

            {/* Citations Badges */}
            {lastResponse.citations?.length > 0 && (
              <div className="pt-3 border-t border-[#e8dfe2]">
                <span className="text-[11px] font-bold text-[#6f5e63] block mb-2">Habits & Messages Cited:</span>
                <div className="flex flex-wrap gap-2">
                  {lastResponse.citations.map((c) => (
                    <button
                      key={c.citation_id}
                      onClick={() => onOpenCitation(c.citation_id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#fcfafb] hover:bg-[#f4ecee] text-[#9b6d77] border border-[#ded1d5] hover:border-[#9b6d77] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Quote className="w-3 h-3 text-[#87ada2]" />
                      <strong>{c.citation_id}</strong>
                      <span className="text-[#6f5e63]">({c.sender}: "{c.quote.slice(0, 30)}...")</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-[#826f74] text-xs flex flex-col items-center">
            <Flame className="w-10 h-10 opacity-40 text-[#9b6d77] mb-2" />
            <p>Pick a target and roast angle above to ignite the comedy engine!</p>
          </div>
        )}
      </div>
    </div>
  );
}
