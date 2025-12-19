import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { usePlaygroundConversations } from "@/hooks/usePlaygroundConversations";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "@/components/playground/ConversationList";
import { ChatInterface } from "@/components/playground/ChatInterface";
import { ContextSelector } from "@/components/playground/ContextSelector";
import { 
  ArrowLeft, 
  MessageCircle, 
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

interface ContentDNAData {
  voiceAnalysis: Record<string, unknown> | null;
  customInstructions: string | null;
}

const PlaygroundPage = () => {
  const { toast } = useToast();
  const { user, tenant } = useAuth();
  const { profiles } = useInstitutionalProfiles();
  
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isLoadingMessages,
    createConversation,
    updateConversationTitle,
    updateConversationContext,
    addMessage,
    deleteConversation,
    selectConversation,
    generateTitle
  } = usePlaygroundConversations();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Context selections
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedDNAId, setSelectedDNAId] = useState<string | null>(null);
  const [contentDNA, setContentDNA] = useState<ContentDNAData | null>(null);
  const [profileConfig, setProfileConfig] = useState<Record<string, unknown> | null>(null);

  // Sync context when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setSelectedProfileId(currentConversation.institutional_profile_id);
      setSelectedDNAId(currentConversation.content_dna_id);
    }
  }, [currentConversation]);

  // Fetch Content DNA when selection changes
  useEffect(() => {
    const fetchDNA = async () => {
      if (!selectedDNAId) {
        setContentDNA(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('content_dna_analysis')
          .select('voice_analysis, custom_instructions')
          .eq('id', selectedDNAId)
          .single();

        if (error) throw error;
        setContentDNA({
          voiceAnalysis: data.voice_analysis as Record<string, unknown>,
          customInstructions: data.custom_instructions
        });
      } catch (error) {
        console.error('Error fetching Content DNA:', error);
        setContentDNA(null);
      }
    };

    fetchDNA();
  }, [selectedDNAId]);

  // Fetch profile config when selection changes
  useEffect(() => {
    if (!selectedProfileId) {
      setProfileConfig(null);
      return;
    }

    const profile = profiles.find(p => p.id === selectedProfileId);
    if (profile) {
      setProfileConfig({
        institutionName: profile.name,
        profileType: profile.profileType,
        ...profile.config
      });
    }
  }, [selectedProfileId, profiles]);

  // Handle context change and update conversation
  const handleProfileChange = useCallback(async (profileId: string | null) => {
    setSelectedProfileId(profileId);
    if (currentConversation) {
      await updateConversationContext(currentConversation.id, profileId, selectedDNAId);
    }
  }, [currentConversation, selectedDNAId, updateConversationContext]);

  const handleDNAChange = useCallback(async (dnaId: string | null) => {
    setSelectedDNAId(dnaId);
    if (currentConversation) {
      await updateConversationContext(currentConversation.id, selectedProfileId, dnaId);
    }
  }, [currentConversation, selectedProfileId, updateConversationContext]);

  // Create new conversation
  const handleNewConversation = useCallback(async () => {
    await createConversation('New Conversation', selectedProfileId, selectedDNAId);
  }, [createConversation, selectedProfileId, selectedDNAId]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !user) return;

    const messageContent = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // Create conversation if none exists
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const newConv = await createConversation(
          generateTitle(messageContent),
          selectedProfileId,
          selectedDNAId
        );
        if (!newConv) throw new Error('Failed to create conversation');
        conversationId = newConv.id;
      }

      // Add user message
      await addMessage(conversationId, 'user', messageContent);

      // Update title if first message
      if (messages.length === 0) {
        await updateConversationTitle(conversationId, generateTitle(messageContent));
      }

      // Call AI
      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          message: messageContent,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          institutionalConfig: null,
          contentDNA,
          profileConfig
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Add assistant message
      await addMessage(conversationId, 'assistant', data.response);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  }, [
    input,
    isSending,
    user,
    currentConversation,
    messages,
    createConversation,
    addMessage,
    updateConversationTitle,
    generateTitle,
    selectedProfileId,
    selectedDNAId,
    contentDNA,
    profileConfig,
    toast
  ]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        {/* Breadcrumb & Header */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">AI Assistant</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <MessageCircle className="w-7 h-7 text-pillar-susceptibility" />
                AI Messaging Assistant
              </h1>
              <p className="text-muted-foreground mt-1">
                Create, review, and strategize communications with your institutional voice
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AIBadge />
            </div>
          </div>

          {/* Context Selector */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <ContextSelector
              selectedProfileId={selectedProfileId}
              selectedDNAId={selectedDNAId}
              onProfileChange={handleProfileChange}
              onDNAChange={handleDNAChange}
              disabled={isSending}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden"
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex min-h-0 overflow-hidden">
          {/* Conversation sidebar */}
          <div className={`w-64 shrink-0 ${showSidebar ? 'block' : 'hidden'} md:block`}>
            <ConversationList
              conversations={conversations}
              currentConversation={currentConversation}
              onSelect={selectConversation}
              onNew={handleNewConversation}
              onDelete={deleteConversation}
              isLoading={isLoading}
            />
          </div>

          {/* Chat interface */}
          <ChatInterface
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            isLoading={isSending}
            isLoadingMessages={isLoadingMessages}
            hasContext={!!(selectedProfileId || selectedDNAId)}
            profileName={selectedProfile?.name}
            hasDNA={!!contentDNA}
          />
        </Card>
      </main>
    </div>
  );
};

export default PlaygroundPage;
