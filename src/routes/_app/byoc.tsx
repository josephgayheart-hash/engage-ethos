import { createFileRoute } from "@tanstack/react-router";
import BYOCPage from "@/pages/BYOCPage";

export const Route = createFileRoute("/_app/byoc")({
  component: BYOCPage,
});
