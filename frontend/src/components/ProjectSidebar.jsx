import React, { useState } from 'react';
import { Folder, Plus, Trash2, Users, MessageSquare, Sparkles, FolderPlus, Compass } from 'lucide-react';

export default function ProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLoadSampleData,
  loadingSample
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    onCreateProject(projectName.trim(), projectDesc.trim());
    setProjectName('');
    setProjectDesc('');
    setShowCreateModal(false);
  };

  return (
    <aside className="w-72 bg-slate-900/60 border-r border-slate-800 flex flex-col h-[calc(100vh-65px)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Folder className="w-4 h-4 text-cyan-400" />
          <span>Projects</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition text-xs flex items-center gap-1 font-medium"
          title="Create New Project"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Quick Sample Scenario Loader */}
      <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border-b border-cyan-900/30">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-semibold text-cyan-200">Specification Demo</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
          Pre-load the official <strong>'Suman'</strong> project with 20-member College Friends group & 1:1 chat.
        </p>
        <button
          onClick={onLoadSampleData}
          disabled={loadingSample}
          className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/20 disabled:opacity-60 transition"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{loadingSample ? 'Loading Demo Chats...' : 'Load "Suman" Scenario'}</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {projects.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <FolderPlus className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            No projects created yet. Click "New" or load the "Suman" scenario.
          </div>
        ) : (
          projects.map((p) => {
            const isActive = p.id === activeProjectId;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`group p-3 rounded-xl border transition cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold text-sm ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${p.name}" and all associated data?`)) {
                        onDeleteProject(p.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    {p.chat_count} {p.chat_count === 1 ? 'chat' : 'chats'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" />
                    {p.participant_count} members
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Create New Project</h2>
            <p className="text-xs text-slate-400 mb-4">
              A project contains multiple independent conversations (groups & 1:1 personal chats) with shared memory.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Suman, College Memories, Tech Team"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Brief note about the conversations in this project..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 resize-none h-20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
