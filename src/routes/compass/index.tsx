import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/route-guards";
import { VoiceStudioGate } from "@/pages/voice-studio/VoiceStudioGate";
import PersonalAIPage from "@/pages/admin/PersonalAIPage";

export const Route = createFileRoute("/compass")({
  component: () => (
    <RequireAuth><VoiceStudioGate><PersonalAIPage /></VoiceStudioGate></RequireAuth>
  ),
});
