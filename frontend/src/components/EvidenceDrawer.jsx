import React from 'react';
import { X, ExternalLink, Quote, Clock, MessageSquare, UserCheck, ShieldCheck } from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, citations, selectedRefId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Evidence Citations</h3>
            <p className="text-[11px] text-slate-400">{citations?.length || 0} Grounded Message References</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Citations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(!citations || citations.length === 0) ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <Quote className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            No citations available for this response.
          </div>
        ) : (
          citations.map((c) => {
            const isHighlight = selectedRefId && selectedRefId.toLowerCase() === c.citation_id.toLowerCase();
            return (
              <div
                key={c.citation_id}
                className={`p-3.5 rounded-xl border transition ${
                  isHighlight
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    {c.citation_id}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{c.timestamp}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{c.sender}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span>In: <strong className="text-slate-300">{c.chat_name}</strong></span>
                  </div>
                </div>

                {/* Quote Box */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 italic font-sans leading-relaxed">
                  "{c.quote}"
                </div>

                {c.relevance_reason && (
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{c.relevance_reason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 text-center">
        All agent claims are verifiable and grounded in imported chat history.
      </div>
    </div>
  );
}
