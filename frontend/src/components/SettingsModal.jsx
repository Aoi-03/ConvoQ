import React, { useState } from 'react';
import { Key, Sparkles, Check, X, ShieldAlert, Cpu } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, health, onSaveSettings }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(health?.model || 'gemini-2.5-flash');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(apiKey.trim(), model);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#150e0f]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#ffffff] border border-[#e8dfe2] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-[#150e0f]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#6f5e63] hover:text-[#150e0f] rounded-lg hover:bg-[#fcfafb] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#f4ecee] border border-[#9b6d77]/20 flex items-center justify-center text-[#9b6d77]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#150e0f]">AI Engine & Model Settings</h2>
            <p className="text-xs text-[#6f5e63]">Configure Gemini API Key & Multimodal Models</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#150e0f] mb-1 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              {health?.gemini_api_configured && (
                <span className="text-[10px] text-[#476e48] font-medium bg-[#eaf2eb] px-1.5 py-0.5 rounded border border-[#b1cab2]/40">Active in Environment</span>
              )}
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder={health?.gemini_api_configured ? "••••••••••••••••••••••••••••••••" : "Paste your Gemini API key (AIza...)"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 pl-9 rounded-xl bg-[#fcfafb] border border-[#e8dfe2] text-[#150e0f] text-xs focus:outline-none focus:border-[#9b6d77] font-mono"
              />
              <Key className="w-4 h-4 text-[#826f74] absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-[#6f5e63] mt-1">
              Provides live audio voice note transcription, image OCR/analysis, and real-time agent synthesis.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#150e0f] mb-1">
              Gemini Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#fcfafb] border border-[#e8dfe2] text-[#150e0f] text-xs focus:outline-none focus:border-[#9b6d77]"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra-fast & Multimodal)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#edf4f2] border border-[#87ada2]/30 text-[11px] text-[#4b7a70]">
            <strong>Hybrid Architecture:</strong> If no API key is entered, ConvoQ automatically executes with intelligent deterministic offline algorithms, BM25 retrieval, and mathematical stylometric modeling!
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#fcfafb] hover:bg-[#f4ecee] text-[#6f5e63] hover:text-[#150e0f] text-xs font-medium border border-[#e8dfe2] transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {saved ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4" />}
              <span>{saved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
