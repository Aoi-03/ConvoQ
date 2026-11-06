import React, { useState } from 'react';
import { BarChart3, Sparkles, Send, Quote, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function DeepAnalyzerView({
  onQuery,
  loading,
  lastResponse,
  onOpenCitation,
  activeScope,
  projectData
}) {
  const [query, setQuery] = useState('');

  const samplePrompts = [
    "Who drives most conversations in the group?",
    "How did the group's mood change over the year?",
    "What are the peak active hours and discussion dynamics?",
    "Summarize key milestones and inside jokes.",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onQuery(query.trim());
  };

  const handlePromptClick = (p) => {
    setQuery(p);
    onQuery(p);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Deep Analyzer Agent
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Pattern & Sentiment Core
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates conversation drivers, participation ratios, mood evolution, and interpersonal group dynamics.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Suggested Analytical Prompts
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(p)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1.5 group"
            >
              <span>{p}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Ask Deep Analyzer (e.g. 'Who drives most conversations in 2023?')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 pr-12 shadow-inner"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition shadow-md shadow-cyan-900/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Response Box */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Analyzing chat dynamics, turn velocity & sentiment shifts...</p>
          </div>
        ) : lastResponse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Analytical Findings
              </span>
              {lastResponse.citations?.length > 0 && (
                <button
                  onClick={() => onOpenCitation()}
                  className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-medium transition"
                >
                  <Quote className="w-3 h-3" />
                  <span>{lastResponse.citations.length} Citations Available</span>
                </button>
              )}
            </div>

            {/* Markdown Answer Render */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
              {lastResponse.answer}
            </div>

            {/* Citation Badges */}
            {lastResponse.citations?.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Verified Grounded Citations:</span>
                <div className="flex flex-wrap gap-2">
                  {lastResponse.citations.map((c) => (
                    <button
                      key={c.citation_id}
                      onClick={() => onOpenCitation(c.citation_id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/80 text-cyan-300 border border-slate-700 hover:border-cyan-500 transition flex items-center gap-1.5"
                    >
                      <Quote className="w-3 h-3 text-cyan-400" />
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
            <BarChart3 className="w-10 h-10 opacity-30 text-slate-400 mb-2" />
            <p>Select a suggested prompt above or type your question to begin analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
