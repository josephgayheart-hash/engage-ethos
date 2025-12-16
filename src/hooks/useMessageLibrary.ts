import { useState, useEffect, useCallback } from 'react';
import type { SavedMessage, LibraryFilters, SortOption } from '@/types/library';

const STORAGE_KEY = 'persist_message_library';

export function useMessageLibrary() {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse message library:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = useCallback((msgs: SavedMessage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    setMessages(msgs);
  }, []);

  const addMessage = useCallback((message: Omit<SavedMessage, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => {
    const now = new Date().toISOString();
    const newMessage: SavedMessage = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      versions: [{
        id: crypto.randomUUID(),
        content: message.content,
        createdAt: now,
      }],
    };
    const updated = [newMessage, ...messages];
    saveToStorage(updated);
    return newMessage;
  }, [messages, saveToStorage]);

  const updateMessage = useCallback((id: string, updates: Partial<SavedMessage>, addVersion = false) => {
    const now = new Date().toISOString();
    const updated = messages.map(msg => {
      if (msg.id !== id) return msg;
      
      const newMsg = { ...msg, ...updates, updatedAt: now };
      
      if (addVersion && updates.content && updates.content !== msg.content) {
        newMsg.versions = [
          {
            id: crypto.randomUUID(),
            content: updates.content,
            createdAt: now,
            changeNotes: updates.notes,
          },
          ...msg.versions,
        ];
      }
      
      return newMsg;
    });
    saveToStorage(updated);
  }, [messages, saveToStorage]);

  const deleteMessage = useCallback((id: string) => {
    const updated = messages.filter(msg => msg.id !== id);
    saveToStorage(updated);
  }, [messages, saveToStorage]);

  const duplicateMessage = useCallback((id: string) => {
    const original = messages.find(msg => msg.id === id);
    if (!original) return null;
    
    const now = new Date().toISOString();
    const duplicate: SavedMessage = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      versions: [{
        id: crypto.randomUUID(),
        content: original.content,
        createdAt: now,
      }],
      approved: false,
    };
    const updated = [duplicate, ...messages];
    saveToStorage(updated);
    return duplicate;
  }, [messages, saveToStorage]);

  const filterMessages = useCallback((filters: LibraryFilters, sort: SortOption = 'newest'): SavedMessage[] => {
    let filtered = [...messages];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(searchLower) ||
        msg.content.toLowerCase().includes(searchLower)
      );
    }

    if (filters.channel) {
      filtered = filtered.filter(msg => msg.channel === filters.channel);
    }

    if (filters.audience) {
      filtered = filtered.filter(msg => msg.audience === filters.audience);
    }

    if (filters.domain) {
      filtered = filtered.filter(msg => msg.domain === filters.domain);
    }

    if (filters.moment) {
      filtered = filtered.filter(msg => msg.moment === filters.moment);
    }

    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return filtered;
  }, [messages]);

  const exportMessage = useCallback((id: string) => {
    const message = messages.find(msg => msg.id === id);
    if (!message) return null;
    
    // Format as readable text
    const textContent = `
${message.title}
${'='.repeat(message.title.length)}

MESSAGE CONTENT
---------------
${message.content}

METADATA
--------
Channel: ${message.channel}
Audience: ${message.audience}
${message.domain ? `Domain: ${message.domain}` : ''}
Moment: ${message.moment}
${message.goal ? `Goal: ${message.goal}` : ''}
${message.tone ? `Tone: ${message.tone}` : ''}
${message.senderRecommendation ? `Sender: ${message.senderRecommendation}` : ''}
Mode: ${message.mode}
Approved: ${message.approved ? 'Yes' : 'No'}

DATES
-----
Created: ${new Date(message.createdAt).toLocaleString()}
Updated: ${new Date(message.updatedAt).toLocaleString()}

${message.notes ? `NOTES\n-----\n${message.notes}\n` : ''}
${message.versions.length > 1 ? `VERSION HISTORY\n---------------\n${message.versions.map((v, i) => `Version ${message.versions.length - i}: ${new Date(v.createdAt).toLocaleString()}${v.changeNotes ? ` - ${v.changeNotes}` : ''}`).join('\n')}` : ''}
`.trim();
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${message.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    return message;
  }, [messages]);

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    deleteMessage,
    duplicateMessage,
    filterMessages,
    exportMessage,
  };
}
