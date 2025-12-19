import { useState, useEffect, useCallback, useRef } from "react";
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
  PenTool, 
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
  const [streamingContent, setStreamingContent] = useState('');
  
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

  // Stream chat helper
  const streamChat = async (
    messageContent: string,
    conversationId: string,
    onDelta: (chunk: string) => void,
    onDone: () => void
  ) => {
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/playground-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        message: messageContent,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        institutionalConfig: null,
        contentDNA,
        profileConfig
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (resp.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      throw new Error("Failed to start stream");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  };

  // Send message with streaming
  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !user) return;

    const messageContent = input.trim();
    setInput('');
    setIsSending(true);
    setStreamingContent('');

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

      // Stream the response
      let fullResponse = '';
      await streamChat(
        messageContent,
        conversationId,
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        async () => {
          // Save final message
          await addMessage(conversationId!, 'assistant', fullResponse);
          setStreamingContent('');
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
      });
      setStreamingContent('');
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
            <span className="text-foreground">Copywriter</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <PenTool className="w-7 h-7 text-pillar-susceptibility" />
                Copywriter
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
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0 overflow-x-auto">
              <ContextSelector
                selectedProfileId={selectedProfileId}
                selectedDNAId={selectedDNAId}
                onProfileChange={handleProfileChange}
                onDNAChange={handleDNAChange}
                disabled={isSending}
              />
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
          {/* Sidebar toggle button - always visible on desktop when collapsed */}
          {!showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="absolute left-2 top-2 z-30 h-8 w-8 hidden md:flex"
              title="Show conversation history"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          )}

          {/* Conversation sidebar */}
          <div className={`
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:hidden'}
            absolute inset-y-0 left-0 z-20 w-64 bg-card transition-transform duration-200
            md:relative md:translate-x-0 ${showSidebar ? 'md:block' : 'md:hidden'}
          `}>
            <ConversationList
              conversations={conversations}
              currentConversation={currentConversation}
              onSelect={(conv) => {
                selectConversation(conv);
                if (window.innerWidth < 768) setShowSidebar(false);
              }}
              onNew={() => {
                handleNewConversation();
                if (window.innerWidth < 768) setShowSidebar(false);
              }}
              onDelete={deleteConversation}
              onCollapse={() => setShowSidebar(false)}
              isLoading={isLoading}
            />
          </div>

          {/* Mobile backdrop */}
          {showSidebar && (
            <div 
              className="absolute inset-0 bg-black/30 z-10 md:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Chat interface */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
              streamingContent={streamingContent}
            />
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PlaygroundPage;
