import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { PanelLeft, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentDNAData {
  voiceAnalysis: Record<string, unknown> | null;
  customInstructions: string | null;
}

const SIDEBAR_KEY = "popout-sidebar";

const CopywriterPopoutPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, tenant, isLoading: authLoading } = useAuth();
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
    generateTitle,
  } = usePlaygroundConversations();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_KEY) !== "0";
  });
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.5-flash");

  const { lastUsedProfileId, setLastUsedProfileId } = useLastUsedProfile(profiles);
  const [selectedProfileId, setSelectedProfileIdLocal] = useState<string | null>(null);
  const [selectedDNAId, setSelectedDNAId] = useState<string | null>(null);
  const [contentDNA, setContentDNA] = useState<ContentDNAData | null>(null);
  const [profileConfig, setProfileConfig] = useState<Record<string, unknown> | null>(null);
  const { campusPhotoCount } = useCampusPhotoCount(selectedProfileId);

  // Persist sidebar visibility
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, showSidebar ? "1" : "0");
  }, [showSidebar]);

  // Update window title to current conversation
  useEffect(() => {
    const base = "Copywriter";
    document.title = currentConversation?.title ? `${currentConversation.title} · ${base}` : base;
  }, [currentConversation?.title]);

  // Auto-select last-used profile
  useEffect(() => {
    if (selectedProfileId || !lastUsedProfileId || !profiles?.length) return;
    if (currentConversation) return;
    const found = profiles.find(p => p.id === lastUsedProfileId);
    if (found) setSelectedProfileIdLocal(lastUsedProfileId);
  }, [lastUsedProfileId, profiles, selectedProfileId, currentConversation]);

  const setSelectedProfileId = useCallback((id: string | null) => {
    setSelectedProfileIdLocal(id);
    if (id) setLastUsedProfileId(id);
  }, [setLastUsedProfileId]);

  // Sync context with conversation
  useEffect(() => {
    if (currentConversation) {
      setSelectedProfileId(currentConversation.institutional_profile_id);
      setSelectedDNAId(currentConversation.content_dna_id);
    }
  }, [currentConversation]);

  // Fetch DNA
  useEffect(() => {
    const fetchDNA = async () => {
      if (!selectedDNAId) { setContentDNA(null); return; }
      try {
        const { data, error } = await supabase
          .from("content_dna_analysis")
          .select("voice_analysis, custom_instructions")
          .eq("id", selectedDNAId)
          .single();
        if (error) throw error;
        setContentDNA({
          voiceAnalysis: data.voice_analysis as Record<string, unknown>,
          customInstructions: data.custom_instructions,
        });
      } catch {
        setContentDNA(null);
      }
    };
    fetchDNA();
  }, [selectedDNAId]);

  // Fetch profile config
  useEffect(() => {
    if (!selectedProfileId) { setProfileConfig(null); return; }
    const profile = profiles.find(p => p.id === selectedProfileId);
    if (profile) {
      setProfileConfig({
        institutionName: profile.name,
        profileType: profile.profileType,
        ...profile.config,
      });
    }
  }, [selectedProfileId, profiles]);

  const handleProfileChange = useCallback(async (profileId: string | null) => {
    setSelectedProfileId(profileId);
    if (currentConversation) await updateConversationContext(currentConversation.id, profileId, selectedDNAId);
  }, [currentConversation, selectedDNAId, updateConversationContext, setSelectedProfileId]);

  const handleDNAChange = useCallback(async (dnaId: string | null) => {
    setSelectedDNAId(dnaId);
    if (currentConversation) await updateConversationContext(currentConversation.id, selectedProfileId, dnaId);
  }, [currentConversation, selectedProfileId, updateConversationContext]);

  const handleNewConversation = useCallback(async () => {
    await createConversation("New Conversation", selectedProfileId, selectedDNAId);
  }, [createConversation, selectedProfileId, selectedDNAId]);

  const streamChat = async (
    messageContent: string,
    _conversationId: string,
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
    onDone();
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !user) return;
    const messageContent = input.trim();
    setInput("");
    setIsSending(true);
    setStreamingContent("");

    try {
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const newConv = await createConversation(generateTitle(messageContent), selectedProfileId, selectedDNAId);
        if (!newConv) throw new Error("Failed to create conversation");
        conversationId = newConv.id;
      }
      await addMessage(conversationId, "user", messageContent);
      if (messages.length === 0) await updateConversationTitle(conversationId, generateTitle(messageContent));
      trackToolUse("playground", "chat", {
        hasProfile: !!selectedProfileId,
        hasDNA: !!selectedDNAId,
        model: selectedModel,
        messageLength: messageContent.length,
        surface: "popout",
      });

      let fullResponse = "";
      await streamChat(messageContent, conversationId, (chunk) => {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }, async () => {
        await addMessage(conversationId!, "assistant", fullResponse);
        setStreamingContent("");
      });
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response.",
      });
      setStreamingContent("");
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, user, currentConversation, messages, createConversation, addMessage, updateConversationTitle, generateTitle, selectedProfileId, selectedDNAId, contentDNA, profileConfig, selectedModel, trackToolUse, toast, industryLabels]);

  // Session expired guard
  if (!authLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-lg font-semibold">Session expired</h1>
          <p className="text-sm text-muted-foreground">
            Please sign in again to continue using the Copywriter.
          </p>
          <Button
            onClick={() => {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.focus();
                  window.opener.location.href = "/login";
                  window.close();
                  return;
                }
              } catch { /* cross-origin */ }
              navigate("/login");
            }}
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Compact top bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title={showSidebar ? "Hide sidebar" : "Show sidebar"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-border shrink-0" />
          <ContextSelector
            selectedProfileId={selectedProfileId}
            selectedDNAId={selectedDNAId}
            onProfileChange={handleProfileChange}
            onDNAChange={handleDNAChange}
            disabled={isSending}
          />
        </div>
        <ModelSelector value={selectedModel} onChange={setSelectedModel} disabled={isSending} />
      </div>

      <div className="flex-1 flex min-h-0">
        <div className={cn(
          "transition-all duration-200 ease-in-out border-r bg-muted/20 overflow-hidden",
          showSidebar ? "w-56 min-w-[14rem]" : "w-0 min-w-0"
        )}>
          {showSidebar && (
            <ConversationList
              conversations={conversations}
              currentConversation={currentConversation}
              onSelect={(conv) => {
                selectConversation(conv);
                if (window.innerWidth < 600) setShowSidebar(false);
              }}
              onNew={() => {
                handleNewConversation();
                if (window.innerWidth < 600) setShowSidebar(false);
              }}
              onDelete={deleteConversation}
              onDeleteAll={deleteAllConversations}
              isLoading={isLoading}
            />
          )}
        </div>

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

export default CopywriterPopoutPage;
