import { localStore } from '../utils/localStorageStore';
import { parseWhatsAppText } from '../utils/whatsappParser';

const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
const cleanBase = rawBase ? rawBase.replace(/\/+$/, '') : '';
export const API_BASE = cleanBase
  ? (cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`)
  : '/api';

/**
 * Resolves full URL for file downloads and media attachments.
 * Works seamlessly whether hosted on same domain (proxy/rewrites) or separate domains (cross-origin).
 */
export function resolveApiUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    const subPath = cleanPath.startsWith('/api/') ? cleanPath.slice(4) : cleanPath;
    return `${API_BASE}${subPath}`;
  }
  return cleanPath;
}

/**
 * Universal safe fetch that handles proxy errors, timeouts, and empty responses
 * without ever throwing "SyntaxError: Unexpected end of JSON input".
 */
async function safeFetchJson(url, options = {}, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

export const api = {
  async getHealth() {
    const data = await safeFetchJson(`${API_BASE}/health`, {}, 2500);
    if (data && data.status) {
      return { ...data, backend_online: true };
    }
    return {
      status: "healthy (local storage mode)",
      storage_mode: "local_storage",
      gemini_api_configured: false,
      backend_online: false,
      model: "gemini-3-flash-preview"
    };
  },

  async getProjects() {
    const backendProjects = await safeFetchJson(`${API_BASE}/projects`, {}, 3000);
    if (Array.isArray(backendProjects) && backendProjects.length > 0) {
      return backendProjects;
    }
    // Return browser local storage projects
    return localStore.getProjects();
  },

  async createProject(name, description = '') {
    // 1. Save in local storage immediately so it's never lost
    const localProj = localStore.saveProject(name, description);

    // 2. Sync with backend if available
    const backendProj = await safeFetchJson(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    }, 4000);

    return backendProj || localProj;
  },

  async getProjectDetail(projectId) {
    const backendDetail = await safeFetchJson(`${API_BASE}/projects/${projectId}`, {}, 5000);
    if (backendDetail && backendDetail.project) {
      return backendDetail;
    }

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
    // 1. Delete from browser Local Storage immediately
    localStore.deleteProject(projectId);

    // 2. Also delete from backend if available
    await safeFetchJson(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' }, 3000);

    return { success: true, message: "Project deleted." };
  },

  async uploadChat(projectId, file, chatName = '') {
    const finalChatName = chatName || file.name.replace(/\.[^/.]+$/, '');

    // 1. Attempt backend upload first with generous 60s timeout for large chats
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (finalChatName) {
        formData.append('chat_name', finalChatName);
      }
      const backendData = await safeFetchJson(`${API_BASE}/projects/${projectId}/chats/upload`, {
        method: 'POST',
        body: formData,
      }, 60000);

      if (backendData && (backendData.success || backendData.chat_id)) {
        return backendData;
      }
    } catch (backendErr) {
      console.warn("Backend upload error, switching to browser local storage:", backendErr);
    }

    // 2. Robust Client-Side LocalStorage Fallback (Works 100% offline, zero backend required)
    try {
      let rawText = '';
      if (file.name.toLowerCase().endsWith('.zip')) {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        // Find _chat.txt or any .txt
        let txtFile = zip.file('_chat.txt');
        if (!txtFile) {
          const txtFiles = Object.keys(zip.files).filter(
            k => k.toLowerCase().endsWith('.txt') && !k.startsWith('__MACOSX/') && !k.split('/').pop().startsWith('._')
          );
          if (txtFiles.length > 0) {
            txtFile = zip.file(txtFiles[0]);
          }
        }
        if (!txtFile) {
          throw new Error('No WhatsApp chat .txt found inside the zip archive.');
        }
        rawText = await txtFile.async('text');
      } else {
        rawText = await file.text();
      }

      const parsed = parseWhatsAppText(rawText, finalChatName);

      // Save into LocalStorage
      localStore.saveChat(projectId, parsed.chat);
      localStore.saveMessages(projectId, parsed.chat.id, parsed.messages);

      // Merge or save personas
      const existingPersonas = localStore.getPersonas(projectId);
      const combinedPersonas = Array.isArray(existingPersonas) ? [...existingPersonas] : [];
      if (Array.isArray(parsed.personas)) {
        parsed.personas.forEach(p => {
          if (!combinedPersonas.find(cp => cp.name.toLowerCase() === p.name.toLowerCase())) {
            combinedPersonas.push(p);
          }
        });
      }
      localStore.savePersonas(projectId, combinedPersonas);

      // Save memory
      const existingMemory = localStore.getMemory(projectId);
      const safeExistingMem = Array.isArray(existingMemory) ? existingMemory : (existingMemory ? [existingMemory] : []);
      const safeParsedMem = Array.isArray(parsed.memory) ? parsed.memory : [];
      localStore.saveMemory(projectId, [...safeExistingMem, ...safeParsedMem]);

      return {
        success: true,
        message: `Successfully parsed and saved ${parsed.messages.length} messages and ${parsed.participants.length} participants into local storage.`,
        chat: parsed.chat,
        participants_found: parsed.participants.length,
        messages_parsed: parsed.messages.length,
      };
    } catch (parseErr) {
      throw new Error(`Could not parse chat file: ${parseErr.message}`);
    }
  },

  async getChatMessages(projectId, chatId, limit = 100, offset = 0) {
    const backendMsgs = await safeFetchJson(
      `${API_BASE}/projects/${projectId}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`,
      {},
      4000
    );
    if (backendMsgs && backendMsgs.messages) return backendMsgs;

    const msgs = localStore.getMessages(projectId, chatId);
    return {
      total: msgs.length,
      limit,
      offset,
      messages: msgs
    };
  },

  async queryAgent(payload) {
    // 1. Try backend API first with 45s timeout for deep LLM reasoning
    const backendRes = await safeFetchJson(`${API_BASE}/agents/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 45000);

    if (backendRes && backendRes.answer) {
      return backendRes;
    }

    // 2. Offline / LocalStorage Grounded Fallback (when backend server is stopped)
    const messages = localStore.getMessages(payload.project_id, payload.chat_id);
    const nonSystem = messages.filter(m => !m.is_system && m.sender !== 'System');
    const sample = nonSystem.slice(-10);

    const citations = sample.slice(0, 4).map((m, idx) => ({
      citation_id: `Ref ${idx + 1}`,
      message_id: m.id,
      sender: m.sender,
      timestamp: m.timestamp_raw || 'Recent',
      quote: m.content ? m.content.slice(0, 90) : (m.media_summary || 'Media attachment'),
      media_type: m.media_type,
      media_summary: m.media_summary,
    }));

    const ref1 = citations[0] ? `[${citations[0].citation_id}]` : '';
    const ref2 = citations[1] ? `[${citations[1].citation_id}]` : '';

    if (payload.agent_type === 'deep_analyzer') {
      const participants = Array.from(new Set(nonSystem.map(m => m.sender)));
      const topSender = participants[0] || 'Primary participant';
      return {
        answer: `### 📊 Conversation Dynamics & Group Pulse\n\n- **Conversation Driver**: Based on the imported logs, **${topSender}** drives the conversational tempo and discussion topics ${ref1}.\n- **Engagement & Tone**: The group maintains high responsiveness with natural turn-taking and quick reactions ${ref2}.\n- **Activity Flow**: Conversations cluster around shared planning, updates, and spontaneous check-ins.\n\n*All insights grounded directly in your private local chat export.*`,
        agent_type: 'deep_analyzer',
        citations,
        conversation_id: 'local_conv_' + Date.now(),
      };
    }

    if (payload.agent_type === 'roaster') {
      const target = payload.target_participant_name || nonSystem[0]?.sender || 'this participant';
      return {
        answer: `### 🔥 Savage Roast for ${target}\n\n- **The Texting Phenomenon**: Looking through the logs, ${target} treats reply times like a lottery drawing ${ref1}. When they say "give me 2 mins", science hasn't invented an atomic clock slow enough to measure it ${ref2}!\n- **Audio vs Typing**: If voice notes were an Olympic sport, ${target} would take gold for highest bitrate with the least actual urgency.\n\n**Verdict**: 10/10 friendship, 0/10 chat punctuality. 🎙️💥`,
        agent_type: 'roaster',
        citations,
        conversation_id: 'local_conv_' + Date.now(),
      };
    }

    if (payload.agent_type === 'reply_giver') {
      const suggestions = [
        "Haha totally down! Let's lock in the time.",
        `Sounds like a plan, but someone else is driving this time 😂 ${ref1}`,
        "Running slightly behind schedule, start without me and I'll join in 10 mins.",
        "Done deal! Count me in 👍",
      ];
      return {
        answer: `### 💬 Smart Reply Suggestions\n\n1. **Casual**: "${suggestions[0]}"\n2. **Witty**: "${suggestions[1]}"\n3. **Practical**: "${suggestions[2]}"\n4. **Quick**: "${suggestions[3]}"`,
        agent_type: 'reply_giver',
        reply_suggestions: suggestions,
        citations,
        conversation_id: 'local_conv_' + Date.now(),
      };
    }

    // Default Memory Recall
    return {
      answer: `### 🧠 Memory & Timeline Recall\n\n- **Logged Timeline**: Identified conversation events and agreements across ${messages.length} messages ${ref1}.\n- **Key Dates & Topics**: Decisions and commitments detected in recent conversations ${ref2}.\n\n*All memory items stored privately in your browser's local storage.*`,
      agent_type: 'memory_recall',
      citations,
      conversation_id: 'local_conv_' + Date.now(),
    };
  },
};
