import React from 'react';
import { Database, HardDrive, Home } from 'lucide-react';

export default function Navbar({ activeProject, onBackToLanding }) {
  return (
    <header className="border-b border-[#e8dfe2] bg-[#ffffff]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between text-[#150e0f] shadow-sm">
      {/* Brand with Back-to-Landing trigger */}
      <div
        onClick={onBackToLanding}
        className="flex items-center gap-3 cursor-pointer group select-none"
        title="Return to Landing Page"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9b6d77] via-[#a37680] to-[#87ada2] flex items-center justify-center text-white shadow-md shadow-[#9b6d77]/25 group-hover:scale-105 transition">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="6" cy="19" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M12 7.5v5m0 0l-6 4m6-4l6 4" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-[#150e0f] group-hover:text-[#9b6d77] transition">
              ConvoQ
            </h1>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#f4ecee] text-[#9b6d77] border border-[#9b6d77]/20 font-semibold">
              Workspace
            </span>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#826f74] -mt-0.5">Conversation Intelligence</p>
        </div>
      </div>

      {/* Middle & Right navigation items */}
      <div className="flex items-center gap-3">
        {/* Back to Home Button */}
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#f9f5f6] text-[#150e0f] border border-[#ded1d5] hover:border-[#9b6d77]/50 text-xs font-semibold shadow-sm transition"
        >
          <Home className="w-3.5 h-3.5 text-[#87ada2]" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>

        {activeProject && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f4ecee] border border-[#9b6d77]/20 text-xs">
            <Database className="w-3.5 h-3.5 text-[#9b6d77]" />
            <span className="text-[#6f5e63]">Project:</span>
            <span className="font-bold text-[#9b6d77]">{activeProject.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e8dfe2] bg-[#ffffff] shadow-sm text-[#6f5e63] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#87ada2] shadow-[0_0_8px_#87ada2] animate-pulse" />
            <span className="hidden sm:inline">LOCALSTORAGE ENABLED</span>
            <span className="sm:hidden font-sans">LOCAL</span>
          </span>
        </div>
      </div>
    </header>
  );
}
