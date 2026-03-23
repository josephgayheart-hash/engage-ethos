import { useState, useEffect, useCallback } from "react";
import { useLastUsedProfile } from "@/hooks/useLastUsedProfile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { usePlaygroundConversations } from "@/hooks/usePlaygroundConversations";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useCampusPhotoCount } from "@/hooks/useCampusPhotoCount";
import { supabase } from "@/integrations/supabase/client";
import { useIndustry } from "@/contexts/IndustryContext";
import { ConversationList } from "@/components/playground/ConversationList";
import { ChatInterface } from "@/components/playground/ChatInterface";
import { ContextSelector } from "@/components/playground/ContextSelector";
import { ModelSelector, type AIModel } from "@/components/playground/ModelSelector";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentDNAData {
  voiceAnalysis: Record<string, unknown> | null;
  customInstructions: string | null;
}

const PlaygroundPage = () => {
  const { toast } = useToast();
  const { user, tenant } = useAuth();
  const { profiles } = useInstitutionalProfiles();
  const { trackToolUse } = useToolTracking();
  const { labels: industryLabels } = useIndustry();
  
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
    deleteAllConversations,
    selectConversation,
    generateTitle
  } = usePlaygroundConversations();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('google/gemini-2.5-flash');
  
  // Context selections
  const { lastUsedProfileId, setLastUsedProfileId } = useLastUsedProfile(profiles);
  const [selectedProfileId, setSelectedProfileIdLocal] = useState<string | null>(null);

  // Auto-initialize from last used / root profile
  useEffect(() => {
    if (selectedProfileId || !lastUsedProfileId || !profiles?.length) return;
    if (currentConversation) return; // Let conversation sync handle it
    const found = profiles.find(p => p.id === lastUsedProfileId);
    if (found) {
      setSelectedProfileIdLocal(lastUsedProfileId);
    }
  }, [lastUsedProfileId, profiles, selectedProfileId, currentConversation]);

  const setSelectedProfileId = useCallback((id: string | null) => {
    setSelectedProfileIdLocal(id);
    if (id) setLastUsedProfileId(id);
  }, [setLastUsedProfileId]);
  const [selectedDNAId, setSelectedDNAId] = useState<string | null>(null);
  const [contentDNA, setContentDNA] = useState<ContentDNAData | null>(null);
  const [profileConfig, setProfileConfig] = useState<Record<string, unknown> | null>(null);
  const { campusPhotoCount } = useCampusPhotoCount(selectedProfileId);

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
        profileConfig,
        model: selectedModel,
        industryContext: industryLabels.industryContext,
        contentStyle: industryLabels.contentStyle,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
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
        if (jsonStr === "[DONE]") { streamDone = true; break; }
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
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const newConv = await createConversation(generateTitle(messageContent), selectedProfileId, selectedDNAId);
        if (!newConv) throw new Error('Failed to create conversation');
        conversationId = newConv.id;
      }
      await addMessage(conversationId, 'user', messageContent);
      if (messages.length === 0) {
        await updateConversationTitle(conversationId, generateTitle(messageContent));
      }
      trackToolUse('playground', 'chat', {
        hasProfile: !!selectedProfileId,
        hasDNA: !!selectedDNAId,
        model: selectedModel,
        messageLength: messageContent.length,
      });

      let fullResponse = '';
      await streamChat(messageContent, conversationId, (chunk) => {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }, async () => {
        await addMessage(conversationId!, 'assistant', fullResponse);
        setStreamingContent('');
      });
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
  }, [input, isSending, user, currentConversation, messages, createConversation, addMessage, updateConversationTitle, generateTitle, selectedProfileId, selectedDNAId, contentDNA, profileConfig, toast]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Compact top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* Sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={showSidebar ? "Hide sidebar" : "Show sidebar"}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <div className="h-5 w-px bg-border" />
          
          {/* Context selectors */}
          <ContextSelector
            selectedProfileId={selectedProfileId}
            selectedDNAId={selectedDNAId}
            onProfileChange={handleProfileChange}
            onDNAChange={handleDNAChange}
            disabled={isSending}
          />
        </div>

        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
          disabled={isSending}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-200 ease-in-out border-r bg-muted/20 overflow-hidden",
          showSidebar ? "w-64 min-w-[16rem]" : "w-0 min-w-0"
        )}>
          {showSidebar && (
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
              onDeleteAll={deleteAllConversations}
              isLoading={isLoading}
            />
          )}
        </div>

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
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            campusPhotoCount={campusPhotoCount}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;
