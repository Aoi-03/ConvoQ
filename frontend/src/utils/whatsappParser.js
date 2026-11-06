// Pure Client-Side WhatsApp Chat Export Parser
// Supports iOS, Android, 12h/24h formats, media detection, and local persona generation.

export function parseWhatsAppText(rawText, defaultChatName = 'WhatsApp Chat') {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Chat file is empty or could not be read as text.');
  }

  const lines = rawText.split(/\r?\n/);
  const messages = [];
  let currentMsg = null;

  // Android / Web regex: "12/05/2023, 14:30 - Sender: message" or "12/5/23, 2:30 pm - Sender: message"
  const androidRegex = /^([\d\/\.\-]+,?\s+[\d:]+(?:\s*[AaPp][Mm])?)\s*-\s*(?:([^:]+?):\s*)?(.*)$/;

  // iOS regex: "[12/05/2023, 14:30:15] Sender: message" or "[12/05/23, 2:30:15 PM] Sender: message"
  const iosRegex = /^\[([\d\/\.\-]+,?\s+[\d:]+(?::\d+)?(?:\s*[AaPp][Mm])?)\]\s*(?:([^:]+?):\s*)?(.*)$/;

  const isSystemNotice = (text) => {
    const lower = text.toLowerCase();
    return (
      lower.includes('end-to-end encrypted') ||
      lower.includes('created group') ||
      lower.includes('added you') ||
      lower.includes('security code changed') ||
      lower.includes('disappearing messages') ||
      lower.includes('left the group') ||
      lower.includes('removed')
    );
  };

  const detectMedia = (content) => {
    const lower = content.toLowerCase();
    if (lower.includes('audio omitted') || lower.includes('voice note omitted') || lower.includes('.opus') || lower.includes('.ogg') || lower.includes('.m4a')) {
      return { type: 'audio', summary: 'Voice memo / audio message' };
    }
    if (lower.includes('image omitted') || lower.includes('<media omitted>') || lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp')) {
      return { type: 'image', summary: 'Photo / image shared' };
    }
    if (lower.includes('video omitted') || lower.includes('.mp4') || lower.includes('.mov')) {
      return { type: 'video', summary: 'Video clip shared' };
    }
    if (lower.includes('document omitted') || lower.includes('.pdf') || lower.includes('.docx') || lower.includes('.zip')) {
      return { type: 'document', summary: 'Document / file shared' };
    }
    return { type: 'none', summary: null };
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    let match = rawLine.match(iosRegex) || rawLine.match(androidRegex);

    if (match) {
      if (currentMsg) {
        messages.push(currentMsg);
      }

      const [, dtStr, senderStr, contentStr] = match;
      const isSystem = !senderStr || isSystemNotice(contentStr || senderStr);
      const sender = isSystem ? 'System' : (senderStr || '').trim();
      const content = (contentStr || '').trim();
      const media = detectMedia(content);

      currentMsg = {
        id: `msg_${Date.now()}_${messages.length + 1}`,
        timestamp_raw: dtStr.trim(),
        timestamp_iso: new Date().toISOString(),
        sender,
        content,
        media_type: media.type,
        media_summary: media.summary,
        is_system: isSystem,
        raw_text: rawLine,
      };
    } else if (currentMsg) {
      // Multiline message continuation
      currentMsg.content += '\n' + rawLine;
      currentMsg.raw_text += '\n' + rawLine;
    }
  }

  if (currentMsg) {
    messages.push(currentMsg);
  }

  if (messages.length === 0) {
    // If no standard regex matched, treat lines as sequential user messages
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const colonIdx = line.indexOf(':');
      let sender = 'Participant';
      let content = line;
      if (colonIdx > 0 && colonIdx < 30) {
        sender = line.slice(0, colonIdx).trim();
        content = line.slice(colonIdx + 1).trim();
      }
      const media = detectMedia(content);
      messages.push({
        id: `msg_${Date.now()}_${i + 1}`,
        timestamp_raw: 'Recent',
        timestamp_iso: new Date().toISOString(),
        sender,
        content,
        media_type: media.type,
        media_summary: media.summary,
        is_system: false,
        raw_text: line,
      });
    }
  }

  // Detect participants
  const participantMap = {};
  messages.forEach((m) => {
    if (m.is_system || m.sender === 'System') return;
    if (!participantMap[m.sender]) {
      participantMap[m.sender] = {
        total_messages: 0,
        voice_notes_sent: 0,
        images_shared: 0,
        words_total: 0,
      };
    }
    const stats = participantMap[m.sender];
    stats.total_messages += 1;
    if (m.media_type === 'audio') stats.voice_notes_sent += 1;
    if (m.media_type === 'image') stats.images_shared += 1;
    stats.words_total += m.content.split(/\s+/).length;
  });

  const participants = Object.keys(participantMap);
  const isGroup = participants.length > 2;

  // Generate Personas based on actual chat behaviors
  const personas = participants.map((name, idx) => {
    const stats = participantMap[name];
    let role = 'The Active Participant';
    let quirks = [];
    let style = 'Frequent messaging';

    if (stats.voice_notes_sent > 2) {
      role = 'The Voice-Note Chronicler';
      quirks.push('Frequently sends voice notes instead of typing text');
      style = 'Heavy audio memos, expressively conversational';
    } else if (stats.images_shared > 2) {
      role = 'The Visual Storyteller';
      quirks.push('Shares photos, screenshots, and visual highlights');
      style = 'Visually expressive with frequent media';
    } else if (stats.words_total / (stats.total_messages || 1) > 25) {
      role = 'The Detailed Planner';
      quirks.push('Writes comprehensive, structured paragraphs');
      style = 'Thorough, analytical, and structured communication';
    } else if (stats.total_messages > 15) {
      role = 'The Conversation Driver';
      quirks.push('Keeps the group chat active and responds rapidly');
      style = 'Fast-paced, high frequency engagement';
    } else {
      role = 'The Casual Banterer';
      quirks.push('Drops in with brief witty replies and reactions');
      style = 'Short, relaxed, and spontaneous texts';
    }

    return {
      id: `p_${idx + 1}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name,
      group_role: role,
      communication_style: style,
      emoji_fingerprint: ['💬', '✨', '⚡', '👍'],
      quirks,
      activity_patterns: stats,
    };
  });

  const chat = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: defaultChatName,
    chat_type: isGroup ? 'group' : 'one_to_one',
    total_messages: messages.length,
    total_media: messages.filter((m) => m.media_type !== 'none').length,
    date_range_start: messages[0]?.timestamp_raw || 'Unknown',
    date_range_end: messages[messages.length - 1]?.timestamp_raw || 'Unknown',
    participants,
  };

  // Generate Memory items
  const memory = [
    {
      id: `mem_${Date.now()}_1`,
      title: `${chat.name} Import`,
      description: `Ingested ${messages.length} messages across ${participants.length} participants (${participants.slice(0, 4).join(', ')}${participants.length > 4 ? '...' : ''}).`,
      event_type: 'chat_ingest',
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    chat,
    messages,
    personas,
    memory,
    participants,
  };
}
