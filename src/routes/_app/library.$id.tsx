import { createFileRoute } from "@tanstack/react-router";
import MessageDetailPage from "@/pages/MessageDetailPage";

export const Route = createFileRoute("/_app/library/$id")({
  component: MessageDetailPage,
});
