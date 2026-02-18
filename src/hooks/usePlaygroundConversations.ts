import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PlaygroundMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface PlaygroundConversation {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  institutional_profile_id: string | null;
  content_dna_id: string | null;
  created_at: string;
  updated_at: string;
}

export function usePlaygroundConversations() {
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<PlaygroundConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<PlaygroundConversation | null>(null);
  const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch all conversations for the user
  const fetchConversations = useCallback(async () => {
    if (!user?.id || !tenant) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('playground_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, tenant]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('playground_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(m => ({
        ...m,
        role: m.role as 'user' | 'assistant' | 'system'
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (
    title: string = 'New Conversation',
    profileId: string | null = null,
    dnaId: string | null = null
  ): Promise<PlaygroundConversation | null> => {
    if (!user?.id || !tenant) return null;

    const tenantId = typeof tenant === 'string' ? tenant : tenant.id;

    try {
      const { data, error } = await supabase
        .from('playground_conversations')
        .insert([{
          user_id: user.id,
          tenant_id: tenantId,
          title,
          institutional_profile_id: profileId,
          content_dna_id: dnaId
        }])
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data);
      setMessages([]);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create new conversation'
      });
      return null;
    }
  }, [user?.id, tenant, toast]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('playground_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title } : c)
      );
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  }, [currentConversation?.id]);

  // Update conversation context (profile/DNA)
  const updateConversationContext = useCallback(async (
    conversationId: string,
    profileId: string | null,
    dnaId: string | null
  ) => {
    try {
      const { error } = await supabase
        .from('playground_conversations')
        .update({ 
          institutional_profile_id: profileId,
          content_dna_id: dnaId 
        })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(c => c.id === conversationId 
          ? { ...c, institutional_profile_id: profileId, content_dna_id: dnaId } 
          : c
        )
      );
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev 
          ? { ...prev, institutional_profile_id: profileId, content_dna_id: dnaId } 
          : null
        );
      }
    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }, [currentConversation?.id]);

  // Add a message to the conversation
  const addMessage = useCallback(async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<PlaygroundMessage | null> => {
    try {
      const { data, error } = await supabase
        .from('playground_messages')
        .insert([{
          conversation_id: conversationId,
          role,
          content
        }])
        .select()
        .single();

      if (error) throw error;

      const typedMessage: PlaygroundMessage = {
        ...data,
        role: data.role as 'user' | 'assistant' | 'system'
      };

      setMessages(prev => [...prev, typedMessage]);
      
      // Update conversation's updated_at
      await supabase
        .from('playground_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return typedMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('playground_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete conversation'
      });
    }
  }, [currentConversation?.id, toast]);

  // Delete all conversations
  const deleteAllConversations = useCallback(async () => {
    if (!user?.id || !tenant) return;
    const tenantId = typeof tenant === 'string' ? tenant : tenant.id;
    try {
      const { error } = await supabase
        .from('playground_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      toast({ title: 'All chats cleared' });
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear conversations'
      });
    }
  }, [user?.id, tenant, toast]);

  // Select a conversation
  const selectConversation = useCallback(async (conversation: PlaygroundConversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  // Generate title from first message
  const generateTitle = useCallback((content: string): string => {
    const words = content.split(' ').slice(0, 6).join(' ');
    return words.length > 40 ? words.substring(0, 40) + '...' : words;
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isLoadingMessages,
    fetchConversations,
    fetchMessages,
    createConversation,
    updateConversationTitle,
    updateConversationContext,
    addMessage,
    deleteConversation,
    deleteAllConversations,
    selectConversation,
    setCurrentConversation,
    setMessages,
    generateTitle
  };
}
