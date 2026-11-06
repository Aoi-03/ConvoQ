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
    <aside className="w-72 bg-[#fcfafb] border-r border-[#e8dfe2] flex flex-col h-[calc(100vh-61px)] text-[#150e0f]">
      {/* Header */}
      <div className="p-4 border-b border-[#e8dfe2] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#150e0f] font-bold text-sm">
          <Folder className="w-4 h-4 text-[#9b6d77]" />
          <span>Projects</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4ecee] text-[#9b6d77] font-semibold">
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 rounded-lg bg-[#f4ecee] hover:bg-[#ebdada] text-[#9b6d77] border border-[#9b6d77]/25 transition text-xs flex items-center gap-1 font-semibold cursor-pointer shadow-sm"
          title="Create New Project"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Quick Sample Scenario Loader */}
      <div className="p-3 bg-gradient-to-r from-[#f4ecee] to-[#edf4f2] border-b border-[#ebdada]">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#9b6d77] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-bold text-[#9b6d77]">Specification Demo</span>
        </div>
        <p className="text-[11px] text-[#5e4f53] mb-2 leading-relaxed">
          Pre-load the official <strong>'Suman'</strong> project with 20-member College Friends group & 1:1 chat.
        </p>
        <button
          onClick={onLoadSampleData}
          disabled={loadingSample}
          className="w-full py-1.5 px-2.5 rounded-lg bg-[#9b6d77] hover:bg-[#865b64] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#9b6d77]/20 disabled:opacity-60 transition cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{loadingSample ? 'Loading Demo Chats...' : 'Load "Suman" Scenario'}</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {projects.length === 0 ? (
          <div className="p-6 text-center text-[#826f74] text-xs">
            <FolderPlus className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#9b6d77]" />
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
                    ? 'bg-[#ffffff] border-[#9b6d77] shadow-md shadow-[#9b6d77]/10 ring-1 ring-[#9b6d77]/30'
                    : 'bg-[#ffffff] border-[#e8dfe2] hover:bg-[#f9f5f6] hover:border-[#ded1d5]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-bold text-sm ${isActive ? 'text-[#9b6d77]' : 'text-[#150e0f]'}`}>
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-[11px] text-[#6f5e63] line-clamp-1 mt-0.5">{p.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${p.name}" and all associated data from local storage?`)) {
                        onDeleteProject(p.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#826f74] hover:text-red-500 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[#6f5e63]">
                  <span className="flex items-center gap-1 font-medium">
                    <MessageSquare className="w-3 h-3 text-[#9b6d77]" />
                    {p.chat_count} {p.chat_count === 1 ? 'chat' : 'chats'}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3 h-3 text-[#87ada2]" />
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
        <div className="fixed inset-0 z-50 bg-[#150e0f]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e8dfe2] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#150e0f] mb-2">Create New Project</h2>
            <p className="text-xs text-[#5e4f53] mb-4">
              A project contains multiple independent conversations (groups & 1:1 personal chats) with shared memory.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#150e0f] mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Suman, College Memories, Tech Team"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fcfafb] border border-[#ded1d5] text-[#150e0f] text-sm focus:outline-none focus:border-[#9b6d77]"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#150e0f] mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Brief note about the conversations in this project..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#fcfafb] border border-[#ded1d5] text-[#150e0f] text-sm focus:outline-none focus:border-[#9b6d77] resize-none h-20"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f4ecee] hover:bg-[#ebdada] text-[#5e4f53] text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] text-white text-xs font-semibold shadow-md transition"
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
