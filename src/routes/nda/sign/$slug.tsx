import { createFileRoute } from "@tanstack/react-router";
import NDASignPage from "@/pages/NDASignPage";

export const Route = createFileRoute("/nda/sign/$slug")({
  component: NDASignPage,
});
