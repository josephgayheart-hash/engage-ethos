import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PersonalLibrary from "./pages/PersonalLibrary";
import SharedLibrary from "./pages/SharedLibrary";
import AdminPanel from "./pages/AdminPanel";
import EvaluatePage from "./pages/EvaluatePage";
import BuildPage from "./pages/BuildPage";
import StrategyPage from "./pages/StrategyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/evaluate" element={<EvaluatePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/library" element={<PersonalLibrary />} />
          <Route path="/shared-library" element={<SharedLibrary />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
