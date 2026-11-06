import React, { useState, useEffect } from 'react';
import {
  Bot, BarChart3, Flame, MessageSquarePlus, History, Users,
  Upload, Sparkles, MessageSquare, Layers, Eye
} from 'lucide-react';

import Navbar from './components/Navbar';
import ProjectSidebar from './components/ProjectSidebar';
import ChatUploadModal from './components/ChatUploadModal';
import EvidenceDrawer from './components/EvidenceDrawer';
import ChatViewerModal from './components/ChatViewerModal';

import DeepAnalyzerView from './components/DeepAnalyzerView';
import RoasterView from './components/RoasterView';
import ReplyGiverView from './components/ReplyGiverView';
import MemoryRecallView from './components/MemoryRecallView';
import PersonasView from './components/PersonasView';

import { api } from './api/client';

export default function App() {
  const [health, setHealth] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);

  // Tabs & Scopes
  const [mainTab, setMainTab] = useState('agents'); // 'agents', 'chats', 'personas'
  const [agentTab, setAgentTab] = useState('deep_analyzer'); // 'deep_analyzer', 'roaster', 'reply_giver', 'memory_recall'
  const [scopeChatId, setScopeChatId] = useState(''); // '' for project level, or specific chat ID

  // Agent State & Responses
  const [agentLoading, setAgentLoading] = useState(false);
  const [lastResponses, setLastResponses] = useState({});

  // Modals & Drawers
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChatViewer, setShowChatViewer] = useState(false);
  const [viewingChat, setViewingChat] = useState(null);

  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedCitationId, setSelectedCitationId] = useState(null);

  const [loadingSample, setLoadingSample] = useState(false);

  // Load initial health & projects
  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
    refreshProjects();
  }, []);

  const refreshProjects = async (selectId = null) => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (selectId) {
        setActiveProjectId(selectId);
      } else if (!activeProjectId && data.length > 0) {
        setActiveProjectId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load project details when active project changes
  useEffect(() => {
    if (activeProjectId) {
      api.getProjectDetail(activeProjectId)
        .then(setProjectDetail)
        .catch(console.error);
    } else {
      setProjectDetail(null);
    }
  }, [activeProjectId]);

  const handleCreateProject = async (name, desc) => {
    try {
      const created = await api.createProject(name, desc);
      await refreshProjects(created.id);
    } catch (err) {
      alert("Failed to create project: " + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
      refreshProjects();
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    }
  };

  const handleLoadSampleScenario = async () => {
    setLoadingSample(true);
    try {
      // Create project "Suman" if not exists
      let sumanProj = projects.find(p => p.name.toLowerCase() === 'suman');
      if (!sumanProj) {
        sumanProj = await api.createProject('Suman', 'Official scenario: 20-member College Friends group & Shrimant 1-to-1 conversation');
      }
      await api.loadSampleData(sumanProj.id);
      await refreshProjects(sumanProj.id);
      const detail = await api.getProjectDetail(sumanProj.id);
      setProjectDetail(detail);
      setMainTab('agents');
      setAgentTab('deep_analyzer');
    } catch (err) {
      alert("Failed loading sample scenario: " + err.message);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleUploadChat = async (file, chatName) => {
    if (!activeProjectId) return;
    try {
      await api.uploadChat(activeProjectId, file, chatName);
      setShowUploadModal(false);
      const detail = await api.getProjectDetail(activeProjectId);
      setProjectDetail(detail);
      refreshProjects(activeProjectId);
    } catch (err) {
      alert("Failed to upload and parse chat: " + err.message);
    }
  };

  const handleSaveSettings = async (apiKey, model) => {
    try {
      const res = await api.updateSettings(apiKey, model);
      setHealth({
        ...health,
        gemini_api_configured: res.gemini_api_configured,
        model: res.model
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Agent Dispatcher
  const handleQueryAgent = async (agentType, payloadExtra = {}) => {
    if (!activeProjectId) {
      alert("Please select or create a project first.");
      return;
    }
    setAgentLoading(true);
    try {
      const payload = {
        project_id: activeProjectId,
        agent_type: agentType,
        chat_id: scopeChatId || null,
        ...payloadExtra,
      };
      const response = await api.queryAgent(payload);
      setLastResponses((prev) => ({ ...prev, [agentType]: response }));
    } catch (err) {
      alert("Agent query failed: " + err.message);
    } finally {
      setAgentLoading(false);
    }
  };

  const openEvidenceDrawer = (citationId = null) => {
    setSelectedCitationId(citationId);
    setEvidenceDrawerOpen(true);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const currentAgentResponse = lastResponses[agentTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        health={health}
        activeProject={activeProject}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Projects */}
        <ProjectSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => setActiveProjectId(id)}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onLoadSampleData={handleLoadSampleScenario}
          loadingSample={loadingSample}
        />

        {/* Main Work Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950">
          {!activeProjectId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/40">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Welcome to Agentic Chase</h2>
              <p className="text-xs text-slate-400 max-w-md">
                Select an existing project or click <strong>"Load 'Suman' Scenario"</strong> on the left to immediately explore the multi-agent chat intelligence platform.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Workspace Header & Main Tabs */}
              <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-2.5 flex items-center justify-between">
                {/* Main Navigation Tabs */}
                <div className="flex items-center gap-2">
                  {[
                    { id: 'agents', label: 'AI Agent Studio', icon: Bot },
                    { id: 'chats', label: `Conversations (${projectDetail?.chats?.length || 0})`, icon: MessageSquare },
                    { id: 'personas', label: `Participant Personas (${projectDetail?.personas?.length || 0})`, icon: Users },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = mainTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setMainTab(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                          isActive
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-sm'
                            : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Action: Ingest WhatsApp Chat */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import WhatsApp Export</span>
                </button>
              </div>

              {/* Sub-Header / Scope Selector for Agents */}
              {mainTab === 'agents' && (
                <div className="border-b border-slate-800 bg-slate-900/20 px-6 py-2 flex items-center justify-between">
                  {/* Specialized Agent Sub-Tabs */}
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'deep_analyzer', label: 'Deep Analyzer', icon: BarChart3, color: 'text-cyan-400' },
                      { id: 'roaster', label: 'The Roaster', icon: Flame, color: 'text-amber-400' },
                      { id: 'reply_giver', label: 'Reply Giver', icon: MessageSquarePlus, color: 'text-emerald-400' },
                      { id: 'memory_recall', label: 'Memory Recall', icon: History, color: 'text-purple-400' },
                    ].map((ag) => {
                      const Icon = ag.icon;
                      const isActive = agentTab === ag.id;
                      return (
                        <button
                          key={ag.id}
                          onClick={() => setAgentTab(ag.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                            isActive
                              ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${ag.color}`} />
                          <span>{ag.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Scoping Selector: Project vs Specific Chat */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Scope:
                    </span>
                    <select
                      value={scopeChatId}
                      onChange={(e) => setScopeChatId(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">All Chats in Project (Global Context)</option>
                      {projectDetail?.chats?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.chat_type === 'group' ? 'Group' : '1:1'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Main Content Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* 1. AGENT STUDIO */}
                {mainTab === 'agents' && (
                  <div className="h-full">
                    {agentTab === 'deep_analyzer' && (
                      <DeepAnalyzerView
                        loading={agentLoading}
                        lastResponse={lastResponses['deep_analyzer']}
                        onOpenCitation={openEvidenceDrawer}
                        activeScope={scopeChatId}
                        projectData={projectDetail}
                        onQuery={(q) => handleQueryAgent('deep_analyzer', { query: q })}
                      />
                    )}

                    {agentTab === 'roaster' && (
                      <RoasterView
                        loading={agentLoading}
                        lastResponse={lastResponses['roaster']}
                        onOpenCitation={openEvidenceDrawer}
                        participants={projectDetail?.participants || []}
                        onRoast={(q, targetName, intensity) =>
                          handleQueryAgent('roaster', {
                            query: q,
                            target_participant_name: targetName,
                            roast_intensity: intensity,
                          })
                        }
                      />
                    )}

                    {agentTab === 'reply_giver' && (
                      <ReplyGiverView
                        loading={agentLoading}
                        lastResponse={lastResponses['reply_giver']}
                        onOpenCitation={openEvidenceDrawer}
                        participants={projectDetail?.participants || []}
                        onSuggest={(q, style, cloneName) =>
                          handleQueryAgent('reply_giver', {
                            query: q,
                            reply_style: style,
                            target_participant_name: cloneName,
                          })
                        }
                      />
                    )}

                    {agentTab === 'memory_recall' && (
                      <MemoryRecallView
                        loading={agentLoading}
                        lastResponse={lastResponses['memory_recall']}
                        onOpenCitation={openEvidenceDrawer}
                        memoryData={projectDetail?.memory}
                        onRecall={(q) => handleQueryAgent('memory_recall', { query: q })}
                      />
                    )}
                  </div>
                )}

                {/* 2. CHATS & INGESTION TAB */}
                {mainTab === 'chats' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h2 className="text-sm font-bold text-white">Project Conversations</h2>
                        <p className="text-xs text-slate-400">
                          Automatically classified into Group and 1:1 Personal Conversations with isolated context.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectDetail?.chats?.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                {c.chat_type === 'group' ? <Users className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-white">{c.name}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  c.chat_type === 'group'
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {c.chat_type === 'group' ? 'Group Chat' : '1:1 Personal'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setViewingChat(c);
                                setShowChatViewer(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 border border-slate-700 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Log</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 py-1 bg-slate-800/40 rounded-xl px-3 border border-slate-800">
                            <div>
                              <span>Total Messages:</span>
                              <strong className="block text-slate-200">{c.total_messages}</strong>
                            </div>
                            <div>
                              <span>Media Attachments:</span>
                              <strong className="block text-cyan-400">{c.total_media}</strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                            <span>Imported: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}</span>
                            <button
                              onClick={() => {
                                setScopeChatId(c.id);
                                setMainTab('agents');
                              }}
                              className="text-cyan-400 hover:underline font-medium"
                            >
                              Interact with Agents &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PARTICIPANT PERSONAS TAB */}
                {mainTab === 'personas' && (
                  <PersonasView
                    personas={projectDetail?.personas || []}
                    onRoastParticipant={(name) => {
                      setMainTab('agents');
                      setAgentTab('roaster');
                      handleQueryAgent('roaster', {
                        query: `Roast ${name} based on their voice-note and chat quirks`,
                        target_participant_name: name,
                      });
                    }}
                    onCloneParticipant={(name) => {
                      setMainTab('agents');
                      setAgentTab('reply_giver');
                      handleQueryAgent('reply_giver', {
                        query: "Are we meeting today?",
                        reply_style: "participant_clone",
                        target_participant_name: name,
                      });
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        citations={currentAgentResponse?.citations || []}
        selectedRefId={selectedCitationId}
      />

      {/* Modals */}
      <ChatUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadChat}
        uploading={false}
      />

      <ChatViewerModal
        isOpen={showChatViewer}
        onClose={() => setShowChatViewer(false)}
        projectId={activeProjectId}
        chat={viewingChat}
      />
    </div>
  );
}
