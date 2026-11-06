import React from 'react';
import { Database, HardDrive, ArrowLeft, Home } from 'lucide-react';

export default function Navbar({ activeProject, onBackToLanding }) {
  return (
    <header className="border-b border-[#1a2436] bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
      {/* Brand with Back-to-Landing trigger */}
      <div
        onClick={onBackToLanding}
        className="flex items-center gap-3 cursor-pointer group select-none"
        title="Return to Landing Page"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.35)] group-hover:scale-105 transition">
          <svg className="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="6" cy="19" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M12 7.5v5m0 0l-6 4m6-4l6 4" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition">
              Agentic Chase
            </h1>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Workspace
            </span>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 -mt-0.5">Conversation Intelligence</p>
        </div>
      </div>

      {/* Middle & Right navigation items */}
      <div className="flex items-center gap-3">
        {/* Back to Home Button */}
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#142036] text-slate-300 hover:text-white border border-[#202c42] hover:border-cyan-500/40 text-xs font-medium transition"
        >
          <Home className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>

        {activeProject && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1524] border border-[#1e2a3e] text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Project:</span>
            <span className="font-semibold text-cyan-300">{activeProject.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-[#0b101c] text-slate-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="hidden sm:inline">LOCALSTORAGE ENABLED</span>
            <span className="sm:hidden font-sans">LOCAL</span>
          </span>
        </div>
      </div>
    </header>
  );
}
