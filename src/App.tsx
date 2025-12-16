import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import OnboardingPage from "./pages/OnboardingPage";
import PersonalLibrary from "./pages/PersonalLibrary";
import SharedLibrary from "./pages/SharedLibrary";
import AdminPanel from "./pages/AdminPanel";
import EvaluatePage from "./pages/EvaluatePage";
import BuildPage from "./pages/BuildPage";
import StrategyPage from "./pages/StrategyPage";
import CallScriptPage from "./pages/CallScriptPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Check if onboarding is complete
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboardingComplete = localStorage.getItem('persist_onboarding_complete') === 'true';
  
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<RequireOnboarding><Index /></RequireOnboarding>} />
          <Route path="/evaluate" element={<RequireOnboarding><EvaluatePage /></RequireOnboarding>} />
          <Route path="/build" element={<RequireOnboarding><BuildPage /></RequireOnboarding>} />
          <Route path="/strategy" element={<RequireOnboarding><StrategyPage /></RequireOnboarding>} />
          <Route path="/call-script" element={<RequireOnboarding><CallScriptPage /></RequireOnboarding>} />
          <Route path="/playground" element={<RequireOnboarding><PlaygroundPage /></RequireOnboarding>} />
          <Route path="/library" element={<RequireOnboarding><PersonalLibrary /></RequireOnboarding>} />
          <Route path="/shared-library" element={<RequireOnboarding><SharedLibrary /></RequireOnboarding>} />
          <Route path="/admin" element={<RequireOnboarding><AdminPanel /></RequireOnboarding>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
