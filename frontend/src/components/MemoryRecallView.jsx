import React, { useState } from 'react';
import { History, Sparkles, Send, Quote, BookmarkCheck, ArrowRight } from 'lucide-react';

export default function MemoryRecallView({
  onRecall,
  loading,
  lastResponse,
  onOpenCitation,
  memoryData
}) {
  const [query, setQuery] = useState('');

  const sampleQueries = [
    "What did we decide about the Goa trip in June 2023?",
    "When was the assignment deadline discussed?",
    "Who paid for the villa booking and what was the amount?",
    "What are our recurring inside jokes?",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onRecall(query.trim());
  };

  const handleSampleClick = (q) => {
    setQuery(q);
    onRecall(q);
  };

  return (
    <div className="flex flex-col h-full space-y-4 text-[#150e0f]">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f4ecee] via-[#ffffff] to-[#edf4f2] border border-[#e8dfe2] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9b6d77]/10 border border-[#9b6d77]/30 flex items-center justify-center text-[#9b6d77]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#150e0f] flex items-center gap-2">
              Memory Recall Agent
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/25 uppercase">
                Grounded History
              </span>
            </h2>
            <p className="text-xs text-[#5e4f53]">
              Retrieves exact historical events, agreements, dates, promises, and plans with pinpoint citations.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Recall Queries */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#6f5e63] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#9b6d77]" />
          Suggested Event Lookups
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSampleClick(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#ffffff] hover:bg-[#f4ecee] text-[#4d3f43] hover:text-[#150e0f] border border-[#ded1d5] hover:border-[#9b6d77]/50 shadow-sm transition flex items-center gap-1.5 group cursor-pointer"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-[#826f74] group-hover:text-[#9b6d77] transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Ask Memory Recall (e.g. 'What did we decide about the Goa trip in June 2023?')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl bg-[#ffffff] border border-[#ded1d5] text-[#150e0f] text-sm focus:outline-none focus:border-[#9b6d77] pr-12 shadow-sm"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="absolute right-2 top-2 p-2 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] disabled:opacity-40 text-white transition shadow-md shadow-[#9b6d77]/20 cursor-pointer"
          title="Search Memory"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Response Box */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#ffffff] border border-[#e8dfe2] shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#6f5e63] space-y-3">
            <div className="w-8 h-8 border-2 border-[#9b6d77] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Searching timeline milestones, agreements & decision history...</p>
          </div>
        ) : lastResponse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8dfe2]">
              <span className="text-xs font-bold text-[#5e4f53] flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-[#9b6d77]" />
                Retrieved Memory Record
              </span>
              {lastResponse.citations?.length > 0 && (
                <button
                  onClick={() => onOpenCitation()}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#f4ecee] hover:bg-[#ebdada] text-[#9b6d77] border border-[#9b6d77]/30 flex items-center gap-1.5 font-semibold transition cursor-pointer"
                >
                  <Quote className="w-3 h-3" />
                  <span>{lastResponse.citations.length} Citations Available</span>
                </button>
              )}
            </div>

            {/* Markdown Answer */}
            <div className="prose prose-sm max-w-none text-[#150e0f] text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
              {lastResponse.answer}
            </div>

            {/* Citations Badges */}
            {lastResponse.citations?.length > 0 && (
              <div className="pt-3 border-t border-[#e8dfe2]">
                <span className="text-[11px] font-bold text-[#6f5e63] block mb-2">Verified Grounded Message Evidence:</span>
                <div className="flex flex-wrap gap-2">
                  {lastResponse.citations.map((c) => (
                    <button
                      key={c.citation_id}
                      onClick={() => onOpenCitation(c.citation_id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#fcfafb] hover:bg-[#f4ecee] text-[#9b6d77] border border-[#ded1d5] hover:border-[#9b6d77] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Quote className="w-3 h-3 text-[#87ada2]" />
                      <strong>{c.citation_id}</strong>
                      <span className="text-[#6f5e63]">({c.sender} @ {c.timestamp})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-[#826f74] text-xs flex flex-col items-center">
            <History className="w-10 h-10 opacity-40 text-[#9b6d77] mb-2" />
            <p>Ask about specific dates, trip decisions, or past conversations to retrieve verifiable evidence.</p>
          </div>
        )}
      </div>
    </div>
  );
}
