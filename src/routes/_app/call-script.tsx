import { createFileRoute } from "@tanstack/react-router";
import CallScriptPage from "@/pages/CallScriptPage";

export const Route = createFileRoute("/_app/call-script")({
  component: CallScriptPage,
});
