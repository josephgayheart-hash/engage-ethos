import { createFileRoute } from "@tanstack/react-router";
import TranslationTool from "@/pages/TranslationTool";

export const Route = createFileRoute("/_embed/embed/translate")({
  component: TranslationTool,
});
