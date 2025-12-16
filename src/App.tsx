import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import BYOCPage from "./pages/BYOCPage";
import CampaignDashboard from "./pages/CampaignDashboard";
import CommunicationCalendar from "./pages/CommunicationCalendar";
import SubjectLineOptimizer from "./pages/SubjectLineOptimizer";
import AccessibilityChecker from "./pages/AccessibilityChecker";
import BrandVoiceScorer from "./pages/BrandVoiceScorer";
import EmailPreview from "./pages/EmailPreview";
import PerformanceBenchmarks from "./pages/PerformanceBenchmarks";
import TranslationTool from "./pages/TranslationTool";
import SettingsPage from "./pages/SettingsPage";
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
      <AuthProvider>
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
            <Route path="/byoc" element={<RequireOnboarding><BYOCPage /></RequireOnboarding>} />
            <Route path="/library" element={<RequireOnboarding><PersonalLibrary /></RequireOnboarding>} />
            <Route path="/shared-library" element={<RequireOnboarding><SharedLibrary /></RequireOnboarding>} />
            <Route path="/admin" element={<RequireOnboarding><AdminPanel /></RequireOnboarding>} />
            <Route path="/campaign-dashboard" element={<RequireOnboarding><CampaignDashboard /></RequireOnboarding>} />
            <Route path="/calendar" element={<RequireOnboarding><CommunicationCalendar /></RequireOnboarding>} />
            <Route path="/subject-optimizer" element={<RequireOnboarding><SubjectLineOptimizer /></RequireOnboarding>} />
            <Route path="/accessibility" element={<RequireOnboarding><AccessibilityChecker /></RequireOnboarding>} />
            <Route path="/brand-voice" element={<RequireOnboarding><BrandVoiceScorer /></RequireOnboarding>} />
            <Route path="/email-preview" element={<RequireOnboarding><EmailPreview /></RequireOnboarding>} />
            <Route path="/benchmarks" element={<RequireOnboarding><PerformanceBenchmarks /></RequireOnboarding>} />
            <Route path="/translate" element={<RequireOnboarding><TranslationTool /></RequireOnboarding>} />
            <Route path="/settings" element={<RequireOnboarding><SettingsPage /></RequireOnboarding>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
