import { createFileRoute } from "@tanstack/react-router";
import PlaygroundPage from "@/pages/PlaygroundPage";

export const Route = createFileRoute("/_app/playground")({
  component: PlaygroundPage,
});
