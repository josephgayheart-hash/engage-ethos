import { createFileRoute } from "@tanstack/react-router";
import ImageGeneratorPage from "@/pages/ImageGeneratorPage";

export const Route = createFileRoute("/_app/image-generator")({
  component: ImageGeneratorPage,
});
