import React, { useState } from 'react';
import { Flame, ShieldCheck, Sparkles, Send, Quote, AlertTriangle, ArrowRight, User } from 'lucide-react';

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
    <div className="flex flex-col h-full space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-red-950/40 border border-amber-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Flame className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              The Roaster Agent
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                Grounded Comedy
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generates hilarious, personalized roasts strictly grounded in actual conversation habits, voice notes, and chat quirks.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safe & Playful Guardrails Active</span>
        </div>
      </div>

      {/* Target & Intensity Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Target Participant */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
            <User className="w-3 h-3 text-cyan-400" />
            Target Participant
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-red-500"
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
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
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
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition border ${
                  intensity === lvl.id
                    ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
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
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Quick Comedic Angles
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleRoasts.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSampleClick(r.prompt)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1.5 group"
            >
              <span>{r.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition" />
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
          className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-red-500 pr-12 shadow-inner"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 disabled:opacity-40 text-white transition shadow-md shadow-red-900/30"
          title="Fire Roast"
        >
          <Flame className="w-4 h-4" />
        </button>
      </form>

      {/* Response Box */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Gathering texting quirks, voice notes evidence, and calculating comedy burns...</p>
          </div>
        ) : lastResponse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Roaster Stage
              </span>
              {lastResponse.citations?.length > 0 && (
                <button
                  onClick={() => onOpenCitation()}
                  className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5 font-medium transition"
                >
                  <Quote className="w-3 h-3" />
                  <span>{lastResponse.citations.length} Verified Evidence Cards</span>
                </button>
              )}
            </div>

            {/* Markdown Answer */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
              {lastResponse.answer}
            </div>

            {/* Citations Badges */}
            {lastResponse.citations?.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Habits & Messages Cited:</span>
                <div className="flex flex-wrap gap-2">
                  {lastResponse.citations.map((c) => (
                    <button
                      key={c.citation_id}
                      onClick={() => onOpenCitation(c.citation_id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-950/80 text-amber-300 border border-slate-700 hover:border-red-500 transition flex items-center gap-1.5"
                    >
                      <Quote className="w-3 h-3 text-red-400" />
                      <strong>{c.citation_id}</strong>
                      <span className="text-slate-400">({c.sender}: "{c.quote.slice(0, 30)}...")</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center">
            <Flame className="w-10 h-10 opacity-30 text-amber-400 mb-2" />
            <p>Pick a target and roast angle above to ignite the comedy engine!</p>
          </div>
        )}
      </div>
    </div>
  );
}
