import React from 'react';
import { X, Quote, Clock, MessageSquare, UserCheck, ShieldCheck } from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, citations, selectedRefId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#ffffff] border-l border-[#e8dfe2] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out text-[#150e0f]">
      {/* Header */}
      <div className="p-4 border-b border-[#e8dfe2] flex items-center justify-between bg-[#ffffff]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f4ecee] border border-[#9b6d77]/30 flex items-center justify-center text-[#9b6d77]">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#150e0f]">Evidence Citations</h3>
            <p className="text-[11px] text-[#6f5e63]">{citations?.length || 0} Grounded Message References</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#826f74] hover:text-[#150e0f] rounded-lg hover:bg-[#f4ecee] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Citations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfafb]">
        {(!citations || citations.length === 0) ? (
          <div className="p-8 text-center text-[#826f74] text-xs">
            <Quote className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#9b6d77]" />
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
                    ? 'bg-[#ffffff] border-[#9b6d77] shadow-lg shadow-[#9b6d77]/15 ring-2 ring-[#9b6d77]/40'
                    : 'bg-[#ffffff] border-[#e8dfe2] hover:border-[#ded1d5]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/30 uppercase">
                    {c.citation_id}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#826f74]">
                    <Clock className="w-3 h-3 text-[#826f74]" />
                    <span>{c.timestamp}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#150e0f]">
                    <UserCheck className="w-3.5 h-3.5 text-[#87ada2]" />
                    <span>{c.sender}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#6f5e63] mt-0.5">
                    <MessageSquare className="w-3 h-3 text-[#9b6d77]" />
                    <span>In: <strong className="text-[#150e0f]">{c.chat_name}</strong></span>
                  </div>
                </div>

                {/* Quote Box */}
                <div className="p-2.5 rounded-lg bg-[#fcfafb] border-l-2 border-[#9b6d77] text-xs text-[#3d3134] italic font-sans leading-relaxed">
                  "{c.quote}"
                </div>

                {c.relevance_reason && (
                  <div className="mt-2 text-[10px] text-[#48684a] flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3 text-[#3d5e40]" />
                    <span>{c.relevance_reason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-[#e8dfe2] bg-[#ffffff] text-[10px] text-[#826f74] text-center font-mono">
        All agent claims are verifiable and grounded in imported chat history.
      </div>
    </div>
  );
}
