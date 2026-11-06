'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowUpRight, BarChart3, Bot, BrainCircuit, ChevronDown, CircleHelp,
  Clock3, Copy, Database, FileText, Flame, Image as ImageIcon, LayoutGrid,
  MessageSquare, Mic, MoreHorizontal, Plus, Quote, Search, Send, ShieldCheck,
  Sparkles, Trash2, Upload, Users, Video, X, Zap
} from 'lucide-react'

type Tab = 'studio' | 'conversations' | 'personas'
type Agent = 'analyzer' | 'roaster' | 'reply' | 'memory'

const chats = [
  { name: 'College Friends — 2024', type: 'GROUP CHAT', messages: '12,480', media: '2.4k', people: '20 members', color: 'cyan', initials: 'CF' },
  { name: 'Shrimant', type: '1:1 PERSONAL', messages: '1,208', media: '184', people: '2 members', color: 'indigo', initials: 'S' },
  { name: 'Trip Planning Core', type: 'GROUP CHAT', messages: '846', media: '96', people: '7 members', color: 'amber', initials: 'TP' },
]
const personas = [
  { name: 'Shrimant', role: 'THE VOICE-NOTE CHRONICLER', style: 'Long-form, high energy, always has one more context point.', emoji: '🎙️ 😂 ☕', quirks: '3-minute voice notes · “Bro listen…” · plans the plan', stats: '2,840 msgs', color: 'cyan', score: '94' },
  { name: 'Riya', role: 'THE CHIEF PLANNER', style: 'Decisive, efficient, turns chaos into a shared spreadsheet.', emoji: '📋 ✨ 🔥', quirks: 'Poll creator · deadline enforcer · “Final final plan”', stats: '1,922 msgs', color: 'indigo', score: '88' },
  { name: 'Aarav', role: 'THE REACTION ENGINE', style: 'Communicates in perfectly timed reactions and one-liners.', emoji: '😂 👀 🤝', quirks: 'Fastest replies · meme drops · “Valid.”', stats: '1,604 msgs', color: 'amber', score: '76' },
  { name: 'Neha', role: 'THE MEMORY KEEPER', style: 'Quietly archives every promise, date, and outstanding split.', emoji: '🧠 🧾 🌙', quirks: 'Screenshot librarian · date receipts · calm corrections', stats: '1,108 msgs', color: 'rose', score: '71' },
]

function loadScenario() {
  const project = { id: 'suman-scenario', name: 'Suman Scenario', description: 'College Friends + Shrimant', created_at: new Date().toISOString(), chat_count: 2, total_messages: 13688 }
  localStorage.setItem('convoq_projects', JSON.stringify([project]))
  localStorage.setItem('convoq_chats', JSON.stringify(chats))
  return project
}

export default function AgenticChase() {
  const [tab, setTab] = useState<Tab>('studio')
  const [agent, setAgent] = useState<Agent>('analyzer')
  const [project, setProject] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState(false)
  const [evidence, setEvidence] = useState(false)
  const [selectedChat, setSelectedChat] = useState(0)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('convoq_projects') || localStorage.getItem('agentic_chase_projects')
    if (saved) setProject(JSON.parse(saved)[0])
  }, [])
  const activeChat = chats[selectedChat]
  const agentInfo = useMemo(() => ({
    analyzer: { label: 'Deep Analyzer', icon: BarChart3, accent: 'cyan', desc: 'Find the signal inside the noise.' },
    roaster: { label: 'The Roaster', icon: Flame, accent: 'amber', desc: 'Witty. Grounded. No cheap shots.' },
    reply: { label: 'Reply Giver', icon: MessageSquare, accent: 'indigo', desc: 'Say it better, in their voice.' },
    memory: { label: 'Memory Recall', icon: BrainCircuit, accent: 'emerald', desc: 'Every agreement, date, and debt.' },
  } as any)[agent], [agent])
  const AgentIcon = agentInfo.icon

  function sendQuery() { if (!query.trim()) return; setSent(true); setTimeout(() => setSent(false), 1800); setQuery('') }
  function scenario() { const p = loadScenario(); setProject(p) }

  return <main className="ac-shell">
    <header className="ac-header">
      <div className="brand"><div className="brand-mark"><Zap size={18} fill="currentColor" /></div><div><div className="brand-name">convo<span>Q</span></div><div className="brand-sub">conversation intelligence</div></div></div>
      <div className="header-center"><div className="project-pill"><span className="status-dot" />{project?.name || 'No project loaded'}<ChevronDown size={14} /></div><div className="local-pill"><Database size={13} /> Local storage enabled</div></div>
      <div className="header-actions"><button className="icon-button" aria-label="Help"><CircleHelp size={18} /></button><button className="avatar">CQ</button></div>
    </header>
    <div className="ac-body">
      <aside className="sidebar">
        <div className="side-section"><div className="side-label">PROJECT MANAGER <button onClick={() => setShowNew(true)}><Plus size={14} /></button></div>
          <button className="scenario-button" onClick={scenario}><Sparkles size={15} /> Load “Suman” scenario <ArrowUpRight size={14} /></button>
          <div className="project-card active"><div className="project-title"><span className="project-dot" />{project?.name || 'Start a project'}<MoreHorizontal size={15} /></div><p>{project ? 'College Friends + Shrimant' : 'Load the sample to begin'}</p><div className="project-meta"><span><MessageSquare size={12}/> {project?.total_messages?.toLocaleString() || '—'}</span><span><Users size={12}/> {project ? '20' : '—'}</span></div></div>
        </div>
        <div className="side-section nav-section"><div className="side-label">WORKSPACE</div>{[['studio', Bot, 'AI Agent Studio'], ['conversations', MessageSquare, 'Conversations'], ['personas', Users, 'Participant Personas']].map(([key, Icon, label]: any) => <button key={key} className={`nav-item ${tab === key ? 'selected' : ''}`} onClick={() => setTab(key)}><Icon size={17}/>{label}<span>{key === 'studio' ? '4' : key === 'conversations' ? '3' : '20'}</span></button>)}</div>
        <div className="sidebar-bottom"><div className="sync"><span className="status-dot green"/><div><strong>Local mode</strong><small>Your data stays in this browser</small></div></div><div className="side-foot"><ShieldCheck size={14}/> Private by default</div></div>
      </aside>
      <section className="workspace">
        {tab === 'studio' && <><div className="workspace-top"><div><div className="eyebrow"><span className="live-dot"/> AGENT STUDIO / READY</div><h1>What do you want to uncover?</h1><p>Four specialized agents. One complete picture of your conversations.</p></div><button className="outline-button"><FileText size={15}/> Import export <Upload size={14}/></button></div>
          <div className="agent-tabs">{(['analyzer','roaster','reply','memory'] as Agent[]).map((key) => { const info:any = ({analyzer:['Deep Analyzer',BarChart3,'cyan'],roaster:['The Roaster',Flame,'amber'],reply:['Reply Giver',MessageSquare,'indigo'],memory:['Memory Recall',BrainCircuit,'emerald']} as any)[key]; const I=info[1]; return <button key={key} className={`agent-tab ${agent===key?'active '+info[2]:''}`} onClick={() => setAgent(key)}><I size={16}/><span>{info[0]}</span><small>{key==='analyzer'?'01':key==='roaster'?'02':key==='reply'?'03':'04'}</small></button>})}</div>
          <div className="studio-grid"><div className="agent-main"><div className="agent-heading"><div className={`agent-icon ${agentInfo.accent}`}><AgentIcon size={22}/></div><div><h2>{agentInfo.label}</h2><p>{agentInfo.desc}</p></div><span className="grounded"><ShieldCheck size={13}/> Grounded in evidence</span></div>
            <div className="scope-row"><span>Scope</span><button className="scope-select"><LayoutGrid size={14}/> All chats in project <ChevronDown size={14}/></button><span className="scope-or">or</span><button className="scope-select muted">{activeChat.name}<ChevronDown size={14}/></button></div>
            {agent==='analyzer' ? <><div className="insight-card"><div className="insight-top"><span className="tag cyan">KEY INSIGHT</span><span className="mono">GENERATED JUST NOW</span></div><h3>Conversation energy peaks on <em>Thursday evenings.</em></h3><p>Riya initiates 38% of planning threads, while Shrimant owns the longest average messages. Reply velocity is faster when a trip is involved.</p><div className="evidence-line"><button onClick={() => setEvidence(true)}>[Ref 1]</button><span>Guys I made a sheet — Riya, 18:42</span><button onClick={() => setEvidence(true)}>[Ref 2]</button><span>Okay hear me out — Shrimant, 19:07</span></div></div><div className="query-chips"><span>Try asking</span>{['Who drives most conversations?','Show mood shifts in 2024','What are our recurring topics?'].map(x=><button key={x} onClick={()=>setQuery(x)}>{x}<ArrowUpRight size={13}/></button>)}</div></> : <div className="agent-placeholder"><div className={`placeholder-orb ${agentInfo.accent}`}><AgentIcon size={32}/></div><h3>{agent==='roaster' ? 'Who are we putting on the grill?' : agent==='reply' ? 'Let’s craft the perfect reply.' : 'What should we recall?'}</h3><p>Choose a target and ask the agent to begin. Results will always include citations from your imported chats.</p><div className="control-row"><button className="control-button">{agent==='roaster'?'Shrimant':'Select participant'} <ChevronDown size={14}/></button><button className="control-button">{agent==='roaster'?'Savage 🔥':'Casual'} <ChevronDown size={14}/></button></div></div>}
            <div className="composer"><div className="composer-icon"><Search size={17}/></div><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing)sendQuery()}} placeholder={`Ask ${agentInfo.label} anything...`}/><button className="send-button" onClick={sendQuery} aria-label="Send"><Send size={16}/></button></div>{sent&&<div className="sent-toast">Query sent to {agentInfo.label}</div>}
          </div><aside className="studio-side"><div className="side-card"><div className="card-kicker"><Activity size={14}/> PROJECT PULSE</div><div className="pulse-number">13.7k <span>messages</span></div><div className="pulse-bar"><i/></div><div className="pulse-meta"><span>3 chats</span><span>20 people</span><span>Jan — Dec 2024</span></div></div><div className="side-card evidence-card"><div className="card-kicker"><Quote size={14}/> EVIDENCE LAYER</div><h3>Answers you can trust.</h3><p>Every insight is linked to the exact message that supports it.</p><div className="evidence-stat"><strong>1,204</strong><span>verified references</span></div><button onClick={()=>setEvidence(true)}>Browse evidence <ArrowUpRight size={14}/></button></div><div className="tip-card"><Sparkles size={16}/><div><strong>Pro tip</strong><p>Ask specific questions for sharper answers.</p></div></div></aside></div></>}
        {tab === 'conversations' && <Conversations selected={selectedChat} setSelected={setSelectedChat}/>} {tab === 'personas' && <Personas setAgent={setAgent} setTab={setTab}/>}</section>
    </div>
    {evidence&&<div className="drawer-backdrop" onClick={()=>setEvidence(false)}><aside className="evidence-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><div className="eyebrow">EVIDENCE DRAWER</div><h2>Reference details</h2></div><button className="icon-button" onClick={()=>setEvidence(false)}><X size={18}/></button></div><div className="ref-badge">[Ref 1] <span>VERIFIED</span></div><blockquote>“Guys I made a sheet with three options. Please vote by tonight so we can actually book this.”</blockquote><div className="ref-meta"><span><strong>Riya</strong> sender</span><span><strong>18:42</strong> timestamp</span><span><strong>College Friends — 2024</strong> source chat</span></div><div className="message-context"><span>CONTEXT</span><p>“I’m free after the 14th”</p><p>“Same, but not Sunday”</p><p className="highlight">“Guys I made a sheet with three options…”</p></div></aside></div>}
    {showNew&&<div className="modal-backdrop" onClick={()=>setShowNew(false)}><div className="new-modal" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setShowNew(false)}><X size={18}/></button><div className="eyebrow">NEW PROJECT</div><h2>Start a new investigation.</h2><p>Import a WhatsApp export to begin uncovering the story.</p><input placeholder="Project name"/><textarea placeholder="Description (optional)"/><button className="primary-button" onClick={()=>{scenario();setShowNew(false)}}>Create project <ArrowUpRight size={15}/></button></div></div>}
  </main>
}

function Conversations({selected,setSelected}:any){ return <div className="view-content"><div className="workspace-top"><div><div className="eyebrow"><span className="live-dot"/> CONVERSATIONS / 03 CHATS</div><h1>Your conversation archive.</h1><p>Every thread, media type, and memorable moment in one place.</p></div><button className="primary-button"><Upload size={15}/> Import WhatsApp export</button></div><div className="conversation-grid">{chats.map((c,i)=><button className={`conversation-card ${selected===i?'selected':''}`} key={c.name} onClick={()=>setSelected(i)}><div className={`chat-avatar ${c.color}`}>{c.initials}</div><div className="chat-card-top"><span className={`tag ${c.color}`}>{c.type}</span><MoreHorizontal size={16}/></div><h3>{c.name}</h3><p>Jan 08, 2024 <span>—</span> Dec 29, 2024</p><div className="chat-stats"><span><MessageSquare size={13}/>{c.messages}</span><span><Mic size={13}/>{c.media}</span><span><Users size={13}/>{c.people}</span></div><div className="view-log">View message log <ArrowUpRight size={14}/></div></button>)}</div><div className="media-summary"><div className="summary-title"><div><div className="eyebrow">MEDIA INTELLIGENCE</div><h2>The group speaks in more than words.</h2></div><span>Across all conversations</span></div><div className="summary-stats"><div><ImageIcon size={18}/><strong>1,842</strong><span>Images shared</span></div><div><Mic size={18}/><strong>532</strong><span>Voice notes</span></div><div><Video size={18}/><strong>86</strong><span>Videos shared</span></div><div><FileText size={18}/><strong>24</strong><span>Documents</span></div></div></div></div> }
function Personas({setAgent,setTab}:any){return <div className="view-content"><div className="workspace-top"><div><div className="eyebrow"><span className="live-dot"/> PERSONA LAB / 20 PROFILES</div><h1>Meet the people behind the messages.</h1><p>Behavioral patterns, communication fingerprints, and signature quirks.</p></div><button className="outline-button"><DownloadIcon/> Export personas</button></div><div className="persona-grid">{personas.map(p=><div className="persona-card" key={p.name}><div className={`persona-avatar ${p.color}`}>{p.name.slice(0,1)}</div><div className="persona-head"><div><h3>{p.name}</h3><span className={`role ${p.color}`}>{p.role}</span></div><span className="persona-score">{p.score}<small> / 100</small></span></div><p className="persona-style">{p.style}</p><div className="emoji-row">{p.emoji}</div><div className="quirks"><span>SIGNATURE QUIRKS</span><p>{p.quirks}</p></div><div className="persona-foot"><span>{p.stats}</span><button onClick={()=>{setAgent('roaster');setTab('studio')}}>Roast this person <Flame size={13}/></button></div></div>)}</div></div>}
function DownloadIcon(){return <FileText size={15}/>}
