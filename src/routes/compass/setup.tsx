import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/route-guards";
import VoiceStudioSetup from "@/pages/voice-studio/VoiceStudioSetup";

export const Route = createFileRoute("/compass/setup")({
  component: () => (
    <RequireAuth><VoiceStudioSetup /></RequireAuth>
  ),
});
