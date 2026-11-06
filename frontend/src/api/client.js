import { localStore } from '../utils/localStorageStore';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Offline fallback
    }
    return {
      status: "healthy (local mode)",
      storage_mode: "local_storage",
      gemini_api_configured: false,
      model: "gemini-2.5-flash"
    };
  },

  async getProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const backendProjects = await res.json();
        if (backendProjects && backendProjects.length > 0) {
          return backendProjects;
        }
      }
    } catch (e) {}
    // Return browser local storage projects
    return localStore.getProjects();
  },

  async createProject(name, description = '') {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        const proj = await res.json();
        localStore.saveProject(name, description);
        return proj;
      }
    } catch (e) {}

    // Pure browser local storage creation
    return localStore.saveProject(name, description);
  },

  async getProjectDetail(projectId) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const project = localStore.getProject(projectId);
    const chats = localStore.getChats(projectId);
    const personas = localStore.getPersonas(projectId);
    const memory = localStore.getMemory(projectId);
    const messages = localStore.getMessages(projectId);

    return {
      project: project || { id: projectId, name: "Project", description: "" },
      chats,
      participants: personas.map(p => ({
        id: p.id,
        name: p.name,
        message_count: p.activity_patterns?.total_messages || 0,
        voice_note_count: p.activity_patterns?.voice_notes_sent || 0,
        image_count: p.activity_patterns?.images_shared || 0,
      })),
      personas,
      memory,
      total_messages: messages.length
    };
  },

  async deleteProject(projectId) {
    // 1. Delete from browser Local Storage
    localStore.deleteProject(projectId);

    // 2. Also delete from backend if available
    try {
      await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' });
    } catch (e) {}

    return { success: true, message: "Project deleted from local storage." };
  },

  async loadSampleData(projectId) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/load-sample-data`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Local sample scenario fallback
    const groupChat = localStore.saveChat(projectId, {
      name: "College Friends 🎓",
      chat_type: "group",
      total_messages: 58,
      total_media: 8,
      date_range_start: "2023-01-15T09:30:00",
      date_range_end: "2023-10-10T11:15:00",
      participants: ["Shrimant", "Rahul", "Sneha", "Amit", "Pooja", "Suman", "Kabir", "Neha", "Vikram", "Divya"]
    });

    const directChat = localStore.saveChat(projectId, {
      name: "Shrimant",
      chat_type: "one_to_one",
      total_messages: 16,
      total_media: 4,
      date_range_start: "2023-01-14T16:20:10",
      date_range_end: "2023-05-28T11:35:00",
      participants: ["Shrimant", "Suman"]
    });

    // Save personas
    localStore.savePersonas(projectId, [
      {
        id: "p_shrimant",
        name: "Shrimant",
        group_role: "The Voice-Note Chronicler",
        communication_style: "Frequent multi-minute audio memos • Peak activity late night",
        emoji_fingerprint: ["🎙️", "😂", "☕", "🔥"],
        quirks: ["Replaces 5-word text replies with 2-minute voice notes while walking."],
        activity_patterns: { total_messages: 24, voice_notes_sent: 7, images_shared: 2 }
      },
      {
        id: "p_suman",
        name: "Suman",
        group_role: "The Academic Lifesaver",
        communication_style: "Clear, structured messages • Helpful study guides",
        emoji_fingerprint: ["🙏", "🎉", "📚", "🚀"],
        quirks: ["Shares handwritten diagrams and organizes celebrations."],
        activity_patterns: { total_messages: 19, voice_notes_sent: 1, images_shared: 3 }
      },
      {
        id: "p_rahul",
        name: "Rahul",
        group_role: "The Chief Planner",
        communication_style: "Initiates plans • Group leader tone",
        emoji_fingerprint: ["🎓", "📢", "📅"],
        quirks: ["Sends group updates at 9:00 AM on the dot."],
        activity_patterns: { total_messages: 15, voice_notes_sent: 0, images_shared: 1 }
      }
    ]);

    return {
      success: true,
      message: "Sample datasets loaded into local storage.",
      chats: [groupChat, directChat]
    };
  },

  async uploadChat(projectId, file, chatName = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (chatName) {
      formData.append('chat_name', chatName);
    }
    const res = await fetch(`${API_BASE}/projects/${projectId}/chats/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async getChatMessages(projectId, chatId, limit = 100, offset = 0) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const msgs = localStore.getMessages(projectId, chatId);
    return {
      total: msgs.length,
      limit,
      offset,
      messages: msgs
    };
  },

  async queryAgent(payload) {
    const res = await fetch(`${API_BASE}/agents/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
