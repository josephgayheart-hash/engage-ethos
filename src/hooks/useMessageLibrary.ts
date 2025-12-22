import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SavedMessage, LibraryFilters, SortOption } from '@/types/library';

const STORAGE_KEY = 'uplaybook_message_library';
const SYNCED_DB_MESSAGES_KEY = 'uplaybook_synced_db_messages';

export function useMessageLibrary() {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for database messages (like seeded samples) and sync them to localStorage
  const syncDatabaseMessages = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get list of already synced message IDs
      const syncedIds = JSON.parse(localStorage.getItem(SYNCED_DB_MESSAGES_KEY) || '[]');

      // Fetch messages from database that haven't been synced yet
      const { data: dbMessages, error } = await supabase
        .from('personal_messages')
        .select('*')
        .eq('user_id', user.id)
        .not('id', 'in', `(${syncedIds.length > 0 ? syncedIds.map((id: string) => `"${id}"`).join(',') : '""'})`);

      if (error) {
        console.error('Failed to fetch database messages:', error);
        return;
      }

      if (dbMessages && dbMessages.length > 0) {
        // Convert database messages to SavedMessage format
        const newMessages: SavedMessage[] = dbMessages.map(dbMsg => ({
          id: dbMsg.id,
          title: dbMsg.title,
          content: dbMsg.content,
          channel: dbMsg.channel as any,
          audience: dbMsg.audience as any,
          domain: dbMsg.domain as any,
          moment: dbMsg.moment as any,
          goal: dbMsg.goal as any,
          tone: dbMsg.tone as any,
          senderRecommendation: dbMsg.sender_recommendation || undefined,
          createdAt: dbMsg.created_at,
          updatedAt: dbMsg.updated_at,
          versions: [{
            id: crypto.randomUUID(),
            content: dbMsg.content,
            createdAt: dbMsg.created_at,
          }],
          notes: dbMsg.notes || undefined,
          approved: dbMsg.approved || false,
          mode: (dbMsg.mode as 'evaluated' | 'generated' | 'kit') || 'generated',
          institutionalProfileId: dbMsg.institutional_profile_id || undefined,
          source: (dbMsg.metadata as any)?.source || 'other',
        }));

        // Merge with existing localStorage messages
        const stored = localStorage.getItem(STORAGE_KEY);
        let existingMessages: SavedMessage[] = [];
        if (stored) {
          try {
            existingMessages = JSON.parse(stored);
          } catch (e) {
            console.error('Failed to parse message library:', e);
          }
        }

        // Add new messages to the beginning
        const mergedMessages = [...newMessages, ...existingMessages];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedMessages));
        setMessages(mergedMessages);

        // Track synced IDs
        const newSyncedIds = [...syncedIds, ...dbMessages.map(m => m.id)];
        localStorage.setItem(SYNCED_DB_MESSAGES_KEY, JSON.stringify(newSyncedIds));

        console.log(`Synced ${newMessages.length} messages from database to local library`);
      }
    } catch (err) {
      console.error('Error syncing database messages:', err);
    }
  }, []);

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

    // Sync database messages after loading local storage
    syncDatabaseMessages();
  }, [syncDatabaseMessages]);

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

  const clearAllMessages = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    deleteMessage,
    duplicateMessage,
    filterMessages,
    exportMessage,
    clearAllMessages,
  };
}
