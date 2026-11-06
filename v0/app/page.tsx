'use client'

import { useState } from 'react'
import AgenticChase from '@/components/agentic-chase'
import LandingPage from '@/components/landing-page'

export default function Page() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing')

  if (view === 'landing') {
    return (
      <LandingPage
        onLoadScenario={() => setView('workspace')}
        onStartBlank={() => setView('workspace')}
        onSelectAgent={() => setView('workspace')}
      />
    )
  }

  return (
    <div>
      <div className="bg-[#090e1a] border-b border-[#1b2538] px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition"
        >
          ← Return to Landing Page
        </button>
        <span className="font-mono text-[10px] text-slate-500">AGENTIC CHASE ACTIVE WORKSPACE</span>
      </div>
      <AgenticChase />
    </div>
  )
}
