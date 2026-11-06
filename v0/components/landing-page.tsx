'use client'

import React, { useState, useEffect } from 'react'
import {
  Zap, ArrowRight, Plus, Quote, Database, Activity,
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
  // Active agent index defaults to 1 (The Roaster) to match mockup screenshot exactly
  const [activeAgentIndex, setActiveAgentIndex] = useState(1)
  const [isPaused, setIsPaused] = useState(false)

  const agentItems = [
    {
      key: 'deep_analyzer',
      name: 'Deep Analyzer',
      tag: 'grounded in receipts',
      icon: BarChart3,
    },
    {
      key: 'roaster',
      name: 'The Roaster',
      tag: 'grounded in receipts',
      icon: Flame,
    },
    {
      key: 'reply_giver',
      name: 'Reply Giver',
      tag: 'grounded in receipts',
      icon: MessageSquarePlus,
    },
    {
      key: 'memory_recall',
      name: 'Memory Recall',
      tag: 'grounded in receipts',
      icon: History,
    },
  ]

  // Auto-cycle gently through the 4 agents every 3.5s when not hovered
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % agentItems.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [isPaused, agentItems.length])

  return (
    <div className="min-h-screen bg-[#fcfafb] text-[#150e0f] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Subtle Warm Grid & Atmospheric Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(155,109,119,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(155,109,119,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-75 pointer-events-none" />
      <div className="absolute top-[-10%] right-[10%] w-[650px] h-[650px] bg-gradient-to-b from-[#9b6d77]/10 via-[#87ada2]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-t from-[#b1cab2]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9b6d77] via-[#a37680] to-[#87ada2] flex items-center justify-center text-white shadow-md shadow-[#9b6d77]/25">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2.5" />
              <circle cx="6" cy="19" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <path d="M12 7.5v5m0 0l-6 4m6-4l6 4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-[#150e0f] flex items-center gap-1.5">
              ConvoQ
            </h1>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#826f74] block -mt-0.5">
              Conversation Intelligence
            </span>
          </div>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full border border-[#9b6d77]/30 bg-[#f4ecee] text-[#9b6d77] text-xs font-semibold">
            Multi-agent AI
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-[#e8dfe2] bg-[#ffffff] shadow-sm text-[#6f5e63] text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#87ada2] shadow-[0_0_8px_#87ada2] animate-pulse" />
            LOCALSTORAGE ENABLED
          </div>
        </div>
      </header>

      {/* Hero Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 space-y-7">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#9b6d77]/25 bg-[#f4ecee] text-[#9b6d77] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#9b6d77]" />
            <span>Your chats have a point of view</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[68px] font-black tracking-tight leading-[1.05] text-[#150e0f]">
            Turn chat history <br />
            <span className="text-[#9b6d77] drop-shadow-sm">
              into actionable
            </span> <br />
            <span className="text-[#9b6d77] drop-shadow-sm">
              memory.
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-[#5e4f53] text-base sm:text-lg max-w-xl leading-relaxed">
            ConvoQ brings four specialized agents to your exported conversations — so you can understand the dynamic, find the receipts, and reply with context.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onLoadScenario}
              className="px-6 py-3.5 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-[#9b6d77]/30 transition-all transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Load Real WhatsApp Sample</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={onStartBlank}
              className="px-5 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f9f5f6] text-[#150e0f] border border-[#ded1d5] hover:border-[#9b6d77]/60 font-medium text-sm sm:text-base flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#87ada2]" />
              <span>Open Live Workspace</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8dfe2] bg-[#ffffff] shadow-sm text-xs font-mono text-[#6f5e63]">
              <span className="w-2 h-2 rounded-full bg-[#87ada2]" />
              <span>private browser runtime</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8dfe2] bg-[#ffffff] shadow-sm text-xs font-mono text-[#6f5e63]">
              <Quote className="w-3.5 h-3.5 text-[#87ada2]" />
              <span>grounded refs</span>
              <strong className="text-[#150e0f] font-bold ml-1">always</strong>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8dfe2] bg-[#ffffff] shadow-sm text-xs font-mono text-[#6f5e63]">
              <Database className="w-3.5 h-3.5 text-[#b1cab2]" />
              <span>data leaves</span>
              <strong className="text-[#150e0f] font-bold ml-1">never</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Showcase Matching Mockup Screenshot with Smooth Float & Animations */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[440px]">
            {/* Card 1: Background Left "Co... JAN" with Equalizer & Levitation */}
            <div className="w-[82%] rounded-2xl bg-[#ffffff] border border-[#e2e8e5] p-5 shadow-xl animate-float-reverse transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#150e0f]">
                  <Activity className="w-4 h-4 text-[#87ada2] animate-pulse" />
                  <span>Conversation signal</span>
                </div>
              </div>

              {/* Animated Rhythmic Frequency Bars Waveform */}
              <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1 border-b border-[#e8dfe2] relative">
                <div className="w-3 bg-[#9b6d77] rounded-t bar-anim-1 transition-all duration-300" />
                <div className="w-3 bg-[#9b6d77]/80 rounded-t bar-anim-2 transition-all duration-300" />
                <div className="w-3 bg-[#87ada2] rounded-t bar-anim-3 transition-all duration-300" />
                <div className="w-3 bg-[#87ada2]/90 rounded-t bar-anim-4 transition-all duration-300" />
                <div className="w-3 bg-[#b1cab2] rounded-t bar-anim-5 transition-all duration-300" />
                <div className="w-3 bg-[#9b6d77] rounded-t bar-anim-6 transition-all duration-300" />
                <div className="w-3 bg-[#87ada2] rounded-t bar-anim-7 transition-all duration-300" />
                <div className="w-3 bg-[#b1cab2] rounded-t bar-anim-8 transition-all duration-300" />
              </div>
              <div className="pt-2.5 flex items-center justify-between font-mono text-[10px] text-[#826f74] uppercase tracking-widest">
                <span>JAN</span>
                <span className="text-[#87ada2] font-semibold flex items-center gap-1 text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#87ada2] animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Card 2: Foreground Right "AGENT MESH / FOUR PERSPECTIVES" - Exact Match to Screenshot */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="absolute -bottom-8 -right-2 sm:-right-4 w-[92%] rounded-[28px] bg-[#ffffff] border-2 border-[#b5cdc3] p-5 sm:p-6 shadow-[0_24px_50px_rgba(155,109,119,0.16),0_4px_24px_rgba(135,173,162,0.18)] animate-float-slow transition-all relative overflow-hidden"
            >
              {/* Header: AGENT MESH / FOUR PERSPECTIVES */}
              <div className="text-[11px] sm:text-xs font-mono font-semibold tracking-[0.18em] text-[#9b6d77] uppercase mb-3.5 sm:mb-4 select-none">
                AGENT MESH / FOUR PERSPECTIVES
              </div>

              {/* 2x2 Interactive Agent Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                {agentItems.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = activeAgentIndex === idx

                  return (
                    <div
                      key={item.key}
                      onClick={() => onSelectAgent(item.key)}
                      onMouseEnter={() => {
                        setActiveAgentIndex(idx)
                        setIsPaused(true)
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer relative ${
                        isActive
                          ? 'border-2 border-[#85586F] bg-[#ffffff] shadow-sm'
                          : 'border border-[#ebdada] bg-[#ffffff] hover:border-[#9b6d77]/40'
                      }`}
                    >
                      {/* Top Row: Icon + Active Radio Indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-[#85586F]' : 'text-[#7a656a]'
                          }`}
                        />

                        {/* Exact Circular Active Radio Reticle from Screenshot */}
                        {isActive && (
                          <div className="w-6 h-6 rounded-full border border-[#85586F] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#85586F]/25" />
                          </div>
                        )}
                      </div>

                      {/* Agent Title */}
                      <div className="font-bold text-sm sm:text-base text-[#150e0f] tracking-tight leading-snug">
                        {item.name}
                      </div>

                      {/* Grounded in receipts subtitle */}
                      <div className="text-[11px] sm:text-xs text-[#826f74] font-mono lowercase mt-1">
                        {item.tag}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Status Bar */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 border-t border-[#e8dfe2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#826f74] text-xs">
        <div>
          A private, local-first demo for your exported conversation history.
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#826f74] flex items-center gap-2">
          <span>LOCAL STATE</span>
          <span>·</span>
          <span>GROUNDED UX</span>
        </div>
      </footer>
    </div>
  )
}
