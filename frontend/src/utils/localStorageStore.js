// Pure Browser LocalStorage Engine - Zero Database Required

const KEYS = {
  PROJECTS: 'convoq_projects',
  CHATS: 'convoq_chats',
  MESSAGES: 'convoq_messages',
  PERSONAS: 'convoq_personas',
  MEMORIES: 'convoq_memories',
  CONVERSATIONS: 'convoq_agent_conversations',
};

const LEGACY_KEYS = {
  PROJECTS: 'agentic_chase_projects',
  CHATS: 'agentic_chase_chats',
  MESSAGES: 'agentic_chase_messages',
  PERSONAS: 'agentic_chase_personas',
  MEMORIES: 'agentic_chase_memories',
  CONVERSATIONS: 'agentic_chase_agent_conversations',
};

function getFromStorage(key, defaultValue = {}) {
  try {
    let raw = localStorage.getItem(key);
    if (!raw) {
      // Check backwards-compatibility legacy key
      const legacyKeyEntry = Object.keys(KEYS).find((k) => KEYS[k] === key);
      if (legacyKeyEntry && LEGACY_KEYS[legacyKeyEntry]) {
        raw = localStorage.getItem(LEGACY_KEYS[legacyKeyEntry]);
      }
    }
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn(`LocalStorage read failed for ${key}:`, e);
    return defaultValue;
  }
}

function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage write failed for ${key}:`, e);
  }
}

export const localStore = {
  // --- Projects ---
  getProjects() {
    let projects = getFromStorage(KEYS.PROJECTS, []);
    // Clean up any legacy auto-created sample project
    const isSampleSuman = (p) => {
      const name = (p.name || '').toLowerCase().trim();
      const desc = (p.description || '').toLowerCase();
      return name === 'suman' && (desc.includes('20-member') || desc.includes('official scenario') || desc.includes('sample'));
    };
    if (projects.some(isSampleSuman)) {
      projects = projects.filter(p => !isSampleSuman(p));
      setToStorage(KEYS.PROJECTS, projects);
    }
    // Also clean up from legacy key if present
    try {
      let legacy = JSON.parse(localStorage.getItem(LEGACY_KEYS.PROJECTS) || '[]');
      if (Array.isArray(legacy) && legacy.some(isSampleSuman)) {
        legacy = legacy.filter(p => !isSampleSuman(p));
        localStorage.setItem(LEGACY_KEYS.PROJECTS, JSON.stringify(legacy));
      }
    } catch (e) {}
    return projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  },

  getProject(projectId) {
    const projects = this.getProjects();
    return projects.find((p) => p.id === projectId) || null;
  },

  saveProject(name, description = '') {
    const projects = this.getProjects();
    const id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const now = new Date().toISOString();
    const newProj = {
      id,
      name,
      description,
      created_at: now,
      updated_at: now,
      chat_count: 0,
      total_messages: 0,
      participant_count: 0,
    };
    projects.push(newProj);
    setToStorage(KEYS.PROJECTS, projects);
    return newProj;
  },

  deleteProject(projectId) {
    // 1. Delete project
    let projects = this.getProjects();
    projects = projects.filter((p) => p.id !== projectId);
    setToStorage(KEYS.PROJECTS, projects);

    // 2. Cascade delete chats
    let chats = getFromStorage(KEYS.CHATS, []);
    const deletedChatIds = chats.filter((c) => c.project_id === projectId).map((c) => c.id);
    chats = chats.filter((c) => c.project_id !== projectId);
    setToStorage(KEYS.CHATS, chats);

    // 3. Cascade delete messages
    let messages = getFromStorage(KEYS.MESSAGES, []);
    messages = messages.filter((m) => m.project_id !== projectId);
    setToStorage(KEYS.MESSAGES, messages);

    // 4. Cascade delete personas
    let personas = getFromStorage(KEYS.PERSONAS, []);
    personas = personas.filter((p) => p.project_id !== projectId);
    setToStorage(KEYS.PERSONAS, personas);

    // 5. Cascade delete memories
    let memories = getFromStorage(KEYS.MEMORIES, []);
    memories = memories.filter((m) => m.project_id !== projectId);
    setToStorage(KEYS.MEMORIES, memories);

    return true;
  },

  // --- Chats ---
  getChats(projectId) {
    const chats = getFromStorage(KEYS.CHATS, []);
    return chats.filter((c) => c.project_id === projectId);
  },

  saveChat(projectId, chatData) {
    const chats = getFromStorage(KEYS.CHATS, []);
    const id = chatData.id || 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const newChat = {
      ...chatData,
      id,
      project_id: projectId,
      created_at: chatData.created_at || new Date().toISOString(),
    };
    chats.push(newChat);
    setToStorage(KEYS.CHATS, chats);

    // Update project stats
    const projects = this.getProjects();
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      proj.chat_count = chats.filter((c) => c.project_id === projectId).length;
      proj.total_messages = (proj.total_messages || 0) + (chatData.total_messages || 0);
      proj.updated_at = new Date().toISOString();
      setToStorage(KEYS.PROJECTS, projects);
    }

    return newChat;
  },

  deleteChat(chatId) {
    let chats = getFromStorage(KEYS.CHATS, []);
    const chat = chats.find((c) => c.id === chatId);
    const projectId = chat ? chat.project_id : null;

    chats = chats.filter((c) => c.id !== chatId);
    setToStorage(KEYS.CHATS, chats);

    // Delete messages of this chat
    let messages = getFromStorage(KEYS.MESSAGES, []);
    messages = messages.filter((m) => m.chat_id !== chatId);
    setToStorage(KEYS.MESSAGES, messages);

    // Update project stats
    if (projectId) {
      const projects = this.getProjects();
      const proj = projects.find((p) => p.id === projectId);
      if (proj) {
        proj.chat_count = chats.filter((c) => c.project_id === projectId).length;
        proj.updated_at = new Date().toISOString();
        setToStorage(KEYS.PROJECTS, projects);
      }
    }
  },

  // --- Messages ---
  saveMessages(projectId, chatId, messagesList) {
    const messages = getFromStorage(KEYS.MESSAGES, []);
    const tagged = messagesList.map((m) => ({
      ...m,
      project_id: projectId,
      chat_id: chatId,
    }));
    messages.push(...tagged);
    setToStorage(KEYS.MESSAGES, messages);
  },

  getMessages(projectId, chatId = null) {
    const messages = getFromStorage(KEYS.MESSAGES, []);
    return messages.filter(
      (m) => m.project_id === projectId && (!chatId || m.chat_id === chatId)
    );
  },

  // --- Personas ---
  savePersonas(projectId, personasList) {
    let personas = getFromStorage(KEYS.PERSONAS, []);
    // Remove existing for this project to update
    personas = personas.filter((p) => p.project_id !== projectId);
    personas.push(...personasList.map((p) => ({ ...p, project_id: projectId })));
    setToStorage(KEYS.PERSONAS, personas);

    // Update participant count in project
    const projects = this.getProjects();
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      proj.participant_count = personasList.length;
      setToStorage(KEYS.PROJECTS, projects);
    }
  },

  getPersonas(projectId) {
    const personas = getFromStorage(KEYS.PERSONAS, []);
    return personas.filter((p) => p.project_id === projectId);
  },

  // --- Memory ---
  saveMemory(projectId, memoryObj) {
    let memories = getFromStorage(KEYS.MEMORIES, []);
    memories = memories.filter((m) => m.project_id !== projectId);
    memories.push({ ...memoryObj, project_id: projectId, updated_at: new Date().toISOString() });
    setToStorage(KEYS.MEMORIES, memories);
  },

  getMemory(projectId) {
    const memories = getFromStorage(KEYS.MEMORIES, []);
    return memories.find((m) => m.project_id === projectId) || null;
  },

  // Clear everything in local storage
  clearAll() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
