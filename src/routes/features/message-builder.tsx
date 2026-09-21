import { createFileRoute } from "@tanstack/react-router";
import MessageBuilderFeaturePage from "@/pages/features/MessageBuilderFeaturePage";

export const Route = createFileRoute("/features/message-builder")({
  component: MessageBuilderFeaturePage,
});
