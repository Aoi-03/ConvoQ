'use client'

import React from 'react'
import {
  Zap, ArrowRight, Plus, Box, Quote, Database, Activity,
  BarChart3, Flame, MessageSquarePlus, History, Sparkles
} from 'lucide-react'

interface LandingPageProps {
  onLoadScenario: () => void
  onStartBlank: () => void
  onSelectAgent: (agent: string) => void
}

export default function LandingPage({
  onLoadScenario,
  onStartBlank,
  onSelectAgent
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Subtle Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#131a29_1px,transparent_1px),linear-gradient(to_bottom,#131a29_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] right-[10%] w-[650px] h-[650px] bg-gradient-to-b from-cyan-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-t from-cyan-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
            <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2.5" />
              <circle cx="6" cy="19" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <path d="M12 7.5v5m0 0l-6 4m6-4l6 4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Agentic Chase
            </h1>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400 block -mt-0.5">
              Conversation Intelligence
            </span>
          </div>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-[#0d1a2b]/80 backdrop-blur-md text-cyan-300 text-xs font-medium">
            Multi-agent AI
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-slate-800 bg-[#0b101c]/80 backdrop-blur-md text-slate-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            LOCALSTORAGE ENABLED
          </div>
        </div>
      </header>

      {/* Hero Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 space-y-7">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-[#0c1626]/80 backdrop-blur-md text-cyan-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Your chats have a point of view</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[68px] font-black tracking-tight leading-[1.05] text-white">
            Turn chat history <br />
            <span className="text-[#38bdf8] drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]">
              into actionable
            </span> <br />
            <span className="text-[#38bdf8] drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]">
              memory.
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            Agentic Chase brings four specialized agents to your exported conversations — so you can understand the dynamic, find the receipts, and reply with context.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onLoadScenario}
              className="px-6 py-3.5 rounded-xl bg-[#22d3ee] hover:bg-[#38bdf8] text-[#070b14] font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Load Suman scenario</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={onStartBlank}
              className="px-5 py-3.5 rounded-xl bg-[#0d1424]/90 hover:bg-[#131e36] text-slate-200 border border-[#22314d] hover:border-cyan-500/50 font-medium text-sm sm:text-base flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Start a blank project</span>
            </button>
          </div>

          {/* Feature Badges Row */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1b263b] bg-[#0b101c]/80 text-xs font-mono text-slate-400">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>agents</span>
              <strong className="text-white font-bold ml-1">04</strong>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1b263b] bg-[#0b101c]/80 text-xs font-mono text-slate-400">
              <Quote className="w-3.5 h-3.5 text-cyan-400" />
              <span>grounded refs</span>
              <strong className="text-white font-bold ml-1">always</strong>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1b263b] bg-[#0b101c]/80 text-xs font-mono text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>data leaves</span>
              <strong className="text-white font-bold ml-1">never</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Showcase Matching landingpageimg.png */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Card 1: Background Left "Conversation signal" */}
            <div className="w-[85%] rounded-2xl bg-[#0b1220]/90 border border-[#1a283e] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Conversation signal</span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#34d399] bg-[#064e3b]/30 border border-[#059669]/40 px-2 py-0.5 rounded">
                  LIVE DEMO
                </span>
              </div>

              {/* Stylized Bars Graphic */}
              <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1 border-b border-[#1a283e]">
                <div className="w-3 bg-cyan-400/80 rounded-t h-[45%]" />
                <div className="w-3 bg-cyan-300 rounded-t h-[75%]" />
                <div className="w-3 bg-indigo-500 rounded-t h-[55%]" />
                <div className="w-3 bg-indigo-400 rounded-t h-[90%]" />
                <div className="w-3 bg-cyan-400 rounded-t h-[70%]" />
                <div className="w-3 bg-cyan-300 rounded-t h-[100%]" />
              </div>
              <div className="pt-2 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                JAN
              </div>
            </div>

            {/* Card 2: Foreground Right "AGENT MESH / FOUR PERSPECTIVES" */}
            <div className="absolute -bottom-8 -right-4 sm:-right-6 w-[90%] rounded-2xl bg-[#070d1a]/95 border border-cyan-500/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-2xl">
              <div className="text-[10px] font-mono font-semibold tracking-widest text-[#38bdf8] mb-3 uppercase">
                AGENT MESH / FOUR PERSPECTIVES
              </div>

              {/* 2x2 Agent Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Deep Analyzer */}
                <div
                  onClick={() => onSelectAgent('analyzer')}
                  className="p-3 rounded-xl bg-[#0c1424]/90 border border-[#1b2a40] hover:border-cyan-500/50 transition cursor-pointer group"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                  <div className="font-bold text-xs text-white">Deep Analyzer</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">grounded in receipts</div>
                </div>

                {/* 2. The Roaster (Highlighted as in landingpageimg.png) */}
                <div
                  onClick={() => onSelectAgent('roaster')}
                  className="p-3 rounded-xl bg-[#0c1527] border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.25)] relative cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition animate-pulse" />
                    <div className="w-6 h-6 rounded-full border border-cyan-400/80 bg-cyan-400/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                    </div>
                  </div>
                  <div className="font-bold text-xs text-white">The Roaster</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">grounded in receipts</div>
                </div>

                {/* 3. Reply Giver */}
                <div
                  onClick={() => onSelectAgent('reply')}
                  className="p-3 rounded-xl bg-[#0c1424]/90 border border-[#1b2a40] hover:border-indigo-500/50 transition cursor-pointer group"
                >
                  <MessageSquarePlus className="w-4 h-4 text-indigo-400 mb-2 group-hover:scale-110 transition" />
                  <div className="font-bold text-xs text-white">Reply Giver</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">grounded in receipts</div>
                </div>

                {/* 4. Memory Recall */}
                <div
                  onClick={() => onSelectAgent('memory')}
                  className="p-3 rounded-xl bg-[#0c1424]/90 border border-[#1b2a40] hover:border-emerald-500/50 transition cursor-pointer group"
                >
                  <History className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                  <div className="font-bold text-xs text-white">Memory Recall</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">grounded in receipts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Status Bar matching landingpageimg.png */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 border-t border-[#131b2c] flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
        <div>
          A private, local-first demo for your exported conversation history.
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <span>LOCAL STATE</span>
          <span>·</span>
          <span>GROUNDED UX</span>
          <span>·</span>
          <span>ZERO SETUP</span>
        </div>
      </footer>
    </div>
  )
}
