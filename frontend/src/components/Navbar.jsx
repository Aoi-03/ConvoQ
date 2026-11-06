import React from 'react';
import { Bot, Database, HardDrive } from 'lucide-react';

export default function Navbar({ activeProject }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white tracking-tight">Agentic Chase</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Multi-Agent AI
            </span>
          </div>
          <p className="text-xs text-slate-400">Chat Intelligence & Multimodal Persona Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {activeProject && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Project:</span>
            <span className="font-medium text-cyan-400">{activeProject.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-medium">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            Local Storage Enabled
          </span>
        </div>
      </div>
    </header>
  );
}
