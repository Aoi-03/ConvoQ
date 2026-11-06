import React, { useState } from 'react';
import { Folder, Plus, Trash2, Users, MessageSquare, FolderPlus } from 'lucide-react';

export default function ProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject
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

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {projects.length === 0 ? (
          <div className="p-6 text-center text-[#826f74] text-xs">
            <FolderPlus className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#9b6d77]" />
            <p className="font-medium text-[#150e0f] mb-1">No projects yet</p>
            <p className="text-[11px] text-[#826f74] mb-3">Create a project to import and analyze WhatsApp conversations.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#9b6d77] hover:bg-[#865b64] text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
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
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#826f74] hover:text-[#c26154] hover:bg-[#f4ecee] rounded transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-[#826f74] font-mono">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[#87ada2]" />
                    {p.chat_count || 0} {p.chat_count === 1 ? 'chat' : 'chats'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#b1cab2]" />
                    {p.participant_count || 0} members
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#150e0f]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e8dfe2] rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="font-bold text-base text-[#150e0f] mb-1">Create New Project</h3>
            <p className="text-xs text-[#6f5e63] mb-4">
              Group related exported conversations and participant personas in browser local storage.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#150e0f] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Friends Trip, Tech Team, Family Chat"
                  className="w-full px-3 py-2 rounded-xl border border-[#e8dfe2] bg-[#fcfafb] text-sm text-[#150e0f] focus:outline-none focus:border-[#9b6d77]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#150e0f] mb-1">Description (Optional)</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="e.g. Group vacation planning, inside jokes, and receipts"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8dfe2] bg-[#fcfafb] text-sm text-[#150e0f] focus:outline-none focus:border-[#9b6d77]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6f5e63] hover:bg-[#f4ecee] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#9b6d77] hover:bg-[#865b64] text-white text-xs font-bold transition shadow-sm"
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
