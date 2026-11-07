import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, FileArchive, Mic, Image as ImageIcon } from 'lucide-react';

export default function ChatUploadModal({ isOpen, onClose, onUpload, uploading }) {
  const [file, setFile] = useState(null);
  const [chatName, setChatName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const isZip = file && file.name.toLowerCase().endsWith('.zip');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!chatName) {
        setChatName(droppedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!chatName) {
        setChatName(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onUpload(file, chatName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#150e0f]/50 backdrop-blur-sm flex items-center justify-center p-4 text-[#150e0f]">
      <div className="bg-[#ffffff] border border-[#e8dfe2] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#826f74] hover:text-[#150e0f] rounded-lg hover:bg-[#f4ecee] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#f4ecee] border border-[#9b6d77]/30 flex items-center justify-center text-[#9b6d77]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#150e0f]">Import WhatsApp Chat</h2>
            <p className="text-xs text-[#5e4f53]">Supports .txt text exports and .zip exports with voice notes & photos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer relative ${
              dragActive
                ? 'border-[#9b6d77] bg-[#f4ecee]'
                : file
                ? isZip
                  ? 'border-[#9b6d77] bg-[#f4ecee]/40'
                  : 'border-[#87ada2] bg-[#edf4f2]'
                : 'border-[#ded1d5] hover:border-[#9b6d77]/60 bg-[#fcfafb]'
            }`}
          >
            <input
              type="file"
              accept=".txt,.zip,application/zip,application/x-zip-compressed"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex flex-col items-center">
                {isZip ? (
                  <FileArchive className="w-10 h-10 text-[#9b6d77] mb-2" />
                ) : (
                  <FileText className="w-10 h-10 text-[#87ada2] mb-2" />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#150e0f]">{file.name}</span>
                  {isZip && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/30 uppercase">
                      ZIP with Media
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#6f5e63] mt-1">
                  {(file.size / 1024 / (file.size > 1024 * 1024 ? 1024 : 1)).toFixed(1)} {file.size > 1024 * 1024 ? 'MB' : 'KB'}
                </span>
                {isZip && (
                  <p className="text-[11px] text-[#3a6357] font-medium mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Mic className="w-3 h-3 text-[#9b6d77]" /> Audio Voice Notes</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><ImageIcon className="w-3 h-3 text-[#87ada2]" /> Photos</span>
                  </p>
                )}
                <span className="text-[10px] text-[#9b6d77] underline mt-2 font-medium">Click or drop another file to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-[#9b6d77] mb-2" />
                <span className="text-xs font-bold text-[#150e0f]">Drag & drop WhatsApp export (.txt or .zip)</span>
                <span className="text-[11px] text-[#5e4f53] mt-1 max-w-xs">
                  Export "With Media" (.zip) to transcribe voice notes & photos, or "Without Media" (.txt) for text only.
                </span>
                <span className="text-xs px-3 py-1 rounded-lg bg-[#f4ecee] text-[#9b6d77] mt-3 font-bold border border-[#9b6d77]/30 shadow-sm">
                  Browse Files
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#150e0f] mb-1">
              Chat Name / Identifier (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. College Friends, Shrimant (1:1), Goa Trip"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#fcfafb] border border-[#ded1d5] text-[#150e0f] text-xs focus:outline-none focus:border-[#9b6d77]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#fcfafb] border border-[#e8dfe2] text-[11px] text-[#5e4f53] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#87ada2] flex-shrink-0 mt-0.5" />
            <span>
              The engine will automatically unpack the export, detect participants, transcribe audio voice notes (.opus), OCR photos, and generate participant personas.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-[#f4ecee] hover:bg-[#ebdada] text-[#5e4f53] text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-4 py-2 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {uploading ? 'Processing & Ingesting...' : 'Parse & Ingest Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
