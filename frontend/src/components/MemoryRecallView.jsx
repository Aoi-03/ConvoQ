import React, { useState } from 'react';
import { History, Sparkles, Send, Quote, BookmarkCheck, ArrowRight, Download, FileDown, FileText, Music, Image as ImageIcon, Video } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';
import { resolveApiUrl } from '../api/client';

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
    "When was the assignment deadline or syllabus PDF shared?",
    "Who sent the voice notes and what were the plans?",
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

  // Detect any referenced files in citations (e.g. PDF documents, voice notes, photos)
  const referencedFiles = (lastResponse?.citations || []).reduce((acc, c) => {
    const match = (c.quote || '').match(/([\w\-.]+\.(?:pdf|docx|xlsx|pptx|opus|mp3|wav|ogg|jpg|jpeg|png|mp4|zip))/i);
    const filename = match
      ? match[1].replace('(file attached)', '').trim()
      : (c.media_file ? c.media_file.split('/').pop().split('\\').pop() : null);

    if (filename && !acc.find(f => f.filename.toLowerCase() === filename.toLowerCase())) {
      acc.push({
        filename,
        sender: c.sender,
        timestamp: c.timestamp,
        download_url: resolveApiUrl(c.download_url || `/api/projects/files/${filename}`),
        citation_id: c.citation_id,
      });
    }
    return acc;
  }, []);

  const getFileIcon = (filename) => {
    const ext = (filename || '').split('.').pop().toLowerCase();
    if (['opus', 'ogg', 'mp3', 'wav'].includes(ext)) return <Music className="w-4 h-4 text-[#9b6d77]" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return <ImageIcon className="w-4 h-4 text-[#87ada2]" />;
    if (['mp4', 'mov', '3gp'].includes(ext)) return <Video className="w-4 h-4 text-[#5e4f53]" />;
    return <FileText className="w-4 h-4 text-[#c26154]" />;
  };

  return (
    <div className="flex flex-col space-y-4 text-[#150e0f] pb-8">
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
      <div className="w-full p-5 md:p-6 rounded-2xl bg-[#ffffff] border border-[#e8dfe2] shadow-sm space-y-4">
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

            {/* Rendered Markdown Output */}
            <MarkdownViewer content={lastResponse.answer} onOpenCitation={onOpenCitation} />

            {/* Referenced Files & Direct Download Options */}
            {referencedFiles.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#f4ecee]/80 via-[#ffffff] to-[#edf4f2]/80 border border-[#9b6d77]/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#150e0f] flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 text-[#9b6d77]" />
                    Referenced Files & Downloads ({referencedFiles.length})
                  </span>
                  <span className="text-[10px] text-[#5e4f53] font-medium">Click to download directly</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {referencedFiles.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.download_url}
                      download={file.filename}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-[#ffffff] hover:bg-[#fcfafb] border border-[#e8dfe2] hover:border-[#9b6d77] shadow-xs transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-[#f4ecee] border border-[#9b6d77]/20 flex items-center justify-center text-[#9b6d77] flex-shrink-0">
                          {getFileIcon(file.filename)}
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-xs font-bold text-[#150e0f] block truncate group-hover:text-[#9b6d77] transition">
                            {file.filename}
                          </span>
                          <span className="text-[10px] text-[#6f5e63] block truncate">
                            {file.sender} • {file.timestamp}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#f4ecee] group-hover:bg-[#9b6d77] text-[#9b6d77] group-hover:text-white transition flex-shrink-0 ml-2 shadow-2xs">
                        <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
