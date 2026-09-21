import { createFileRoute } from "@tanstack/react-router";
import PerformanceBenchmarks from "@/pages/PerformanceBenchmarks";

export const Route = createFileRoute("/_app/benchmarks")({
  component: PerformanceBenchmarks,
});
