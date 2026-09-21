import { createFileRoute } from "@tanstack/react-router";
import TryCopywriterPage from "@/pages/TryCopywriterPage";

export const Route = createFileRoute("/try-copywriter")({
  component: TryCopywriterPage,
});
