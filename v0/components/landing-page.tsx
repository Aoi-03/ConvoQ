'use client'

import React, { useState, useEffect } from 'react'
import {
  Zap, ArrowRight, Plus, Box, Quote, Database, Activity,
  BarChart3, Flame, MessageSquarePlus, History, Sparkles,
  Radio
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
  const [activeAgentIndex, setActiveAgentIndex] = useState(1)
  const [isPaused, setIsPaused] = useState(false)

  const agentItems = [
    {
      key: 'deep_analyzer',
      name: 'Deep Analyzer',
      tag: 'grounded in receipts',
      icon: BarChart3,
      color: 'text-[#9b6d77]',
      activeBorder: 'border-[#9b6d77]',
      activeBg: 'bg-[#fdf8f9]',
      glow: 'shadow-[0_0_20px_rgba(155,109,119,0.2)]',
      badge: '94% clarity · receipts detected',
    },
    {
      key: 'roaster',
      name: 'The Roaster',
      tag: 'grounded in receipts',
      icon: Flame,
      color: 'text-[#9b6d77]',
      activeBorder: 'border-[#9b6d77]',
      activeBg: 'bg-[#fdf8f9]',
      glow: 'shadow-[0_0_20px_rgba(155,109,119,0.22)]',
      badge: 'Target: Shrimant · 14 receipts',
    },
    {
      key: 'reply_giver',
      name: 'Reply Giver',
      tag: 'grounded in receipts',
      icon: MessageSquarePlus,
      color: 'text-[#87ada2]',
      activeBorder: 'border-[#87ada2]',
      activeBg: 'bg-[#f5faf8]',
      glow: 'shadow-[0_0_20px_rgba(135,173,162,0.22)]',
      badge: '3 tones · participant clone',
    },
    {
      key: 'memory_recall',
      name: 'Memory Recall',
      tag: 'grounded in receipts',
      icon: History,
      color: 'text-[#87ada2]',
      activeBorder: 'border-[#87ada2]',
      activeBg: 'bg-[#f5faf8]',
      glow: 'shadow-[0_0_20px_rgba(135,173,162,0.22)]',
      badge: '2 dates · split debt found',
    },
  ]

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % agentItems.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [isPaused, agentItems.length])

  return (
    <div className="min-h-screen bg-[#fcfafb] text-[#150e0f] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Subtle Warm Grid & Atmospheric Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(155,109,119,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(155,109,119,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-70 pointer-events-none" />
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
              Agentic Chase
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
            Agentic Chase brings four specialized agents to your exported conversations — so you can understand the dynamic, find the receipts, and reply with context.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onLoadScenario}
              className="px-6 py-3.5 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-[#9b6d77]/30 transition-all transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Load Suman scenario</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={onStartBlank}
              className="px-5 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f9f5f6] text-[#150e0f] border border-[#ded1d5] hover:border-[#9b6d77]/60 font-medium text-sm sm:text-base flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#87ada2]" />
              <span>Start a blank project</span>
            </button>
          </div>

          {/* Feature Badges Row */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8dfe2] bg-[#ffffff] shadow-sm text-xs font-mono text-[#6f5e63]">
              <Box className="w-3.5 h-3.5 text-[#9b6d77]" />
              <span>agents</span>
              <strong className="text-[#150e0f] font-bold ml-1">04</strong>
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

        {/* Right Column: Visual Showcase Matching landingpageimg.png with Live Smooth Animations */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Card 1: Background Left "Conversation signal" with Live Equalizer & Levitation */}
            <div className="w-[85%] rounded-2xl bg-[#ffffff] border border-[#e8dfe2] p-5 shadow-xl animate-float-reverse transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#150e0f]">
                  <Activity className="w-4 h-4 text-[#87ada2] animate-pulse" />
                  <span>Conversation signal</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#3d5e40] bg-[#eaf2eb] border border-[#b1cab2]/60 px-2 py-0.5 rounded font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#48684a] animate-ping" />
                  <span>LIVE DEMO</span>
                </div>
              </div>

              {/* Animated Rhythmic Frequency Bars Waveform */}
              <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1 border-b border-[#e8dfe2] relative">
                <div className="w-2.5 sm:w-3 bg-[#9b6d77] rounded-t bar-anim-1 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#9b6d77]/80 rounded-t bar-anim-2 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#87ada2] rounded-t bar-anim-3 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#87ada2]/90 rounded-t bar-anim-4 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#b1cab2] rounded-t bar-anim-5 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#9b6d77] rounded-t bar-anim-6 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#87ada2] rounded-t bar-anim-7 transition-all duration-300" />
                <div className="w-2.5 sm:w-3 bg-[#b1cab2] rounded-t bar-anim-8 transition-all duration-300" />
              </div>
              <div className="pt-2.5 flex items-center justify-between font-mono text-[9px] text-[#826f74] uppercase tracking-widest">
                <span>JAN</span>
                <span className="text-[#87ada2] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#87ada2] animate-pulse" />
                  13.6K MSGS STREAMING
                </span>
              </div>
            </div>

            {/* Card 2: Foreground Right "AGENT MESH / FOUR PERSPECTIVES" with Live Radar Targeting & Gentle Float */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="absolute -bottom-8 -right-4 sm:-right-6 w-[90%] rounded-2xl bg-[#ffffff] border-2 border-[#87ada2]/60 p-5 shadow-[0_20px_50px_rgba(155,109,119,0.14),0_0_30px_rgba(135,173,162,0.18)] animate-float-slow transition-all relative overflow-hidden"
            >
              {/* Subtle Scanning Lightbeam Effect */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9b6d77] to-transparent animate-scanline pointer-events-none" />

              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[10px] font-mono font-bold tracking-widest text-[#9b6d77] uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9b6d77] animate-ping" />
                  AGENT MESH / FOUR PERSPECTIVES
                </div>
                <div className="text-[9px] font-mono text-[#826f74] uppercase">
                  {isPaused ? 'Interactive' : 'Auto-Scan'}
                </div>
              </div>

              {/* Real-time Agent Status Ticker */}
              <div className="mb-3 px-2.5 py-1 rounded-lg bg-[#fcfafb] border border-[#ebdada] flex items-center justify-between text-[10px] font-mono text-[#6f5e63]">
                <span className="font-semibold text-[#150e0f] flex items-center gap-1.5 truncate">
                  <Radio className="w-3 h-3 text-[#9b6d77] animate-pulse" />
                  {agentItems[activeAgentIndex]?.name}
                </span>
                <span className="text-[#826f74] text-[9px] truncate ml-1">
                  {agentItems[activeAgentIndex]?.badge}
                </span>
              </div>

              {/* 2x2 Interactive Agent Grid with Smooth Reticle Transitions */}
              <div className="grid grid-cols-2 gap-2.5">
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
                      className={`p-3 rounded-xl transition-all duration-300 cursor-pointer group relative ${
                        isActive
                          ? `border-2 ${item.activeBorder} ${item.activeBg} ${item.glow} scale-[1.02] ring-1 ring-[#9b6d77]/20`
                          : 'border border-[#ebdada] bg-[#fcfafb] hover:border-[#9b6d77]/50 hover:bg-[#ffffff] hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon
                          className={`w-4 h-4 ${item.color} transition-transform duration-300 ${
                            isActive ? 'scale-110 animate-bounce' : 'group-hover:scale-110'
                          }`}
                        />

                        {/* Animated Target Cursor Reticle for the Active Agent */}
                        {isActive ? (
                          <div className="w-6 h-6 rounded-full border border-[#9b6d77] bg-[#f4ecee] flex items-center justify-center relative shadow-xs">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#9b6d77]/30 animate-ping absolute" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#9b6d77]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#e8dfe2] group-hover:border-[#9b6d77]/40 flex items-center justify-center transition">
                            <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-[#9b6d77]/40 transition" />
                          </div>
                        )}
                      </div>

                      <div className="font-bold text-xs text-[#150e0f] group-hover:text-[#9b6d77] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#826f74] font-mono mt-0.5">
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
          <span>·</span>
          <span>ZERO SETUP</span>
        </div>
      </footer>
    </div>
  )
}
