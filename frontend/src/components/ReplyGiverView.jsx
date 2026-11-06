import React, { useState } from 'react';
import { MessageSquarePlus, Copy, Check, Sparkles, Send, Quote, UserCheck, ArrowRight } from 'lucide-react';

export default function ReplyGiverView({
  onSuggest,
  loading,
  lastResponse,
  onOpenCitation,
  participants = []
}) {
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('casual');
  const [cloneName, setCloneName] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const sampleMessages = [
    "Meet at CCD in 20 mins for coffee?",
    "Did you complete the assignment submission?",
    "Guys, are you ready for the Goa trip?",
    "Treat kab dega?? Got placed right?",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSuggest(query.trim(), style, cloneName);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Reply Giver Agent
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Style Cloning
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generates context-aware replies matching your communication style or mimicking any chosen participant.
            </p>
          </div>
        </div>
      </div>

      {/* Style & Clone Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tone Selector */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
            Desired Tone
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'casual', label: 'Casual' },
              { id: 'witty', label: 'Witty' },
              { id: 'diplomatic', label: 'Diplomatic' },
              { id: 'ultra_brief', label: 'Brief' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStyle(t.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition border text-center ${
                  style === t.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style Cloning */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            Clone Participant Persona (Optional)
          </label>
          <select
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- User's Natural Style --</option>
            {participants.map((p) => (
              <option key={p.id || p.name} value={p.name}>
                Mimic: {p.name} ({p.message_count || 0} msgs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Incoming Messages */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Test Situations / Incoming Texts
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleMessages.map((msg, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(msg);
                onSuggest(msg, style, cloneName);
              }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1.5 group"
            >
              <span>"{msg}"</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Paste or type the message you want to reply to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 pr-12 shadow-inner"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition shadow-md shadow-emerald-900/30"
          title="Generate Reply Candidates"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Response & Quick Suggestion Chips */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Generating style-cloned reply variations...</p>
          </div>
        ) : lastResponse ? (
          <div className="space-y-4">
            {/* Quick Chips Section */}
            {lastResponse.reply_suggestions && lastResponse.reply_suggestions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-700/40 space-y-2">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  1-Click Copy Suggestions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lastResponse.reply_suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(suggestion, idx)}
                      className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between group"
                    >
                      <span className="text-xs text-slate-200 line-clamp-2">"{suggestion}"</span>
                      <button
                        type="button"
                        className="p-1 text-slate-400 group-hover:text-emerald-400 transition ml-2 flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Answer */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
              {lastResponse.answer}
            </div>

            {/* Citations */}
            {lastResponse.citations?.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Contextual Source Messages:</span>
                <div className="flex flex-wrap gap-2">
                  {lastResponse.citations.map((c) => (
                    <button
                      key={c.citation_id}
                      onClick={() => onOpenCitation(c.citation_id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/80 text-emerald-300 border border-slate-700 hover:border-emerald-500 transition flex items-center gap-1.5"
                    >
                      <Quote className="w-3 h-3 text-emerald-400" />
                      <strong>{c.citation_id}</strong>
                      <span className="text-slate-400">({c.sender})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center">
            <MessageSquarePlus className="w-10 h-10 opacity-30 text-emerald-400 mb-2" />
            <p>Paste an incoming message or pick a situation above to generate custom responses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
