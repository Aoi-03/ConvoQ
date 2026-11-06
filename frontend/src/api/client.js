const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async updateSettings(geminiApiKey, geminiModel) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key: geminiApiKey, gemini_model: geminiModel }),
    });
    return res.json();
  },

  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async createProject(name, description = '') {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    return res.json();
  },

  async getProjectDetail(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    return res.json();
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async loadSampleData(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/load-sample-data`, {
      method: 'POST',
    });
    return res.json();
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
    const res = await fetch(`${API_BASE}/projects/${projectId}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
    return res.json();
  },

  async getPersonas(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/personas`);
    return res.json();
  },

  async getMemory(projectId, chatId = null) {
    const url = chatId 
      ? `${API_BASE}/projects/${projectId}/memory?chat_id=${chatId}`
      : `${API_BASE}/projects/${projectId}/memory`;
    const res = await fetch(url);
    return res.json();
  },

  async queryAgent(payload) {
    const res = await fetch(`${API_BASE}/agents/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getConversationHistory(convId) {
    const res = await fetch(`${API_BASE}/agents/conversations/${convId}`);
    return res.json();
  },
};
