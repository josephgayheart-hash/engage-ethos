import { createFileRoute } from "@tanstack/react-router";
import SubjectLineOptimizer from "@/pages/SubjectLineOptimizer";

export const Route = createFileRoute("/_app/subject-optimizer")({
  component: SubjectLineOptimizer,
});
