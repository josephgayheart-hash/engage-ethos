import { createFileRoute } from "@tanstack/react-router";
import CommunicationCalendar from "@/pages/CommunicationCalendar";

export const Route = createFileRoute("/_app/calendar")({
  component: CommunicationCalendar,
});
