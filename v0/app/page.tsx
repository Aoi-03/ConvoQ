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
      <div className="bg-[#fcfafb] border-b border-[#e8dfe2] px-6 py-2 flex items-center justify-between text-xs text-[#6f5e63]">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-1.5 text-[#9b6d77] hover:text-[#865b64] font-semibold transition"
        >
          ← Return to Landing Page
        </button>
        <span className="font-mono text-[10px] text-[#826f74]">AGENTIC CHASE ACTIVE WORKSPACE</span>
      </div>
      <AgenticChase />
    </div>
  )
}
