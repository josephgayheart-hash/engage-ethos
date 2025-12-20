import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FeedbackButton } from "@/components/FeedbackButton";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
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
import LoginPage from "./pages/LoginPage";
import RequestAccessPage from "./pages/RequestAccessPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ProfilePage from "./pages/ProfilePage";
import AdminConsolePage from "./pages/admin/AdminConsolePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminOnboardingPage from "./pages/admin/AdminOnboardingPage";
import QADiagnosticsPage from "./pages/admin/QADiagnosticsPage";
import SeedDataPage from "./pages/admin/SeedDataPage";
import InstitutionDetailPage from "./pages/admin/InstitutionDetailPage";
import UserDetailPage from "./pages/admin/UserDetailPage";
import ContentDNAPage from "./pages/admin/ContentDNAPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import InitialSetupPage from "./pages/InitialSetupPage";
import MessageDetailPage from "./pages/MessageDetailPage";
import TemplateDetailPage from "./pages/TemplateDetailPage";
import BetaFeedbackPage from "./pages/BetaFeedbackPage";
import ContentDNAFeaturePage from "./pages/features/ContentDNAFeaturePage";
import MessageBuilderFeaturePage from "./pages/features/MessageBuilderFeaturePage";
import JourneyDesignerFeaturePage from "./pages/features/JourneyDesignerFeaturePage";
import EvaluateFeaturePage from "./pages/features/EvaluateFeaturePage";

const queryClient = new QueryClient();

// Protected route wrapper - requires authentication
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if password reset is required
  if (profile?.password_reset_required) {
    return <Navigate to="/change-password" replace />;
  }

  // Check if user is active
  if (profile?.status !== 'active' && profile?.status !== 'invited') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin route wrapper - requires admin role
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Super Admin route wrapper - requires super_admin role
function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Approver route wrapper - requires approver or admin role
function RequireApprover({ children }: { children: React.ReactNode }) {
  const { isApprover, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!isApprover) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Public route wrapper - redirects authenticated users to dashboard
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (user && profile?.status === 'active' && !profile?.password_reset_required) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/request-access" element={<RequestAccessPage />} />
    <Route path="/feedback" element={<RequireAuth><BetaFeedbackPage /></RequireAuth>} />
    <Route path="/change-password" element={<ChangePasswordPage />} />
    <Route path="/setup" element={<InitialSetupPage />} />
    
    {/* Feature marketing pages */}
    <Route path="/features/content-dna" element={<ContentDNAFeaturePage />} />
    <Route path="/features/message-builder" element={<MessageBuilderFeaturePage />} />
    <Route path="/features/journey-designer" element={<JourneyDesignerFeaturePage />} />
    <Route path="/features/evaluate" element={<EvaluateFeaturePage />} />
    
    {/* Protected routes */}
    <Route path="/dashboard" element={<RequireAuth><Index /></RequireAuth>} />
    <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
    <Route path="/evaluate" element={<RequireAuth><EvaluatePage /></RequireAuth>} />
    <Route path="/build" element={<RequireAuth><BuildPage /></RequireAuth>} />
    <Route path="/strategy" element={<RequireAuth><StrategyPage /></RequireAuth>} />
    <Route path="/call-script" element={<RequireAuth><CallScriptPage /></RequireAuth>} />
    <Route path="/playground" element={<RequireAuth><PlaygroundPage /></RequireAuth>} />
    <Route path="/byoc" element={<RequireAuth><BYOCPage /></RequireAuth>} />
    <Route path="/library" element={<RequireAuth><PersonalLibrary /></RequireAuth>} />
    <Route path="/library/:id" element={<RequireAuth><MessageDetailPage /></RequireAuth>} />
    <Route path="/shared-library" element={<RequireAuth><SharedLibrary /></RequireAuth>} />
    <Route path="/shared-library/:id" element={<RequireAuth><TemplateDetailPage /></RequireAuth>} />
    <Route path="/campaign-dashboard" element={<RequireAuth><CampaignDashboard /></RequireAuth>} />
    <Route path="/calendar" element={<RequireAuth><CommunicationCalendar /></RequireAuth>} />
    <Route path="/subject-optimizer" element={<RequireAuth><SubjectLineOptimizer /></RequireAuth>} />
    <Route path="/accessibility" element={<RequireAuth><AccessibilityChecker /></RequireAuth>} />
    <Route path="/brand-voice" element={<RequireAuth><BrandVoiceScorer /></RequireAuth>} />
    <Route path="/email-preview" element={<RequireAuth><EmailPreview /></RequireAuth>} />
    <Route path="/benchmarks" element={<RequireAuth><PerformanceBenchmarks /></RequireAuth>} />
    <Route path="/translate" element={<RequireAuth><TranslationTool /></RequireAuth>} />
    <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
    <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
    
    {/* Approver routes */}
    <Route path="/approvals" element={<RequireAuth><RequireApprover><ApprovalsPage /></RequireApprover></RequireAuth>} />
    
    {/* Super Admin routes */}
    <Route path="/admin/panel" element={<RequireAuth><RequireSuperAdmin><AdminPanel /></RequireSuperAdmin></RequireAuth>} />
    <Route path="/admin/onboarding" element={<RequireAuth><RequireSuperAdmin><AdminOnboardingPage /></RequireSuperAdmin></RequireAuth>} />
    <Route path="/admin/qa" element={<RequireAuth><RequireSuperAdmin><QADiagnosticsPage /></RequireSuperAdmin></RequireAuth>} />
    <Route path="/admin/seed" element={<RequireAuth><RequireSuperAdmin><SeedDataPage /></RequireSuperAdmin></RequireAuth>} />
    <Route path="/admin/institution/:id" element={<RequireAuth><RequireSuperAdmin><InstitutionDetailPage /></RequireSuperAdmin></RequireAuth>} />
    <Route path="/admin/user/:id" element={<RequireAuth><RequireSuperAdmin><UserDetailPage /></RequireSuperAdmin></RequireAuth>} />
    
    {/* Content DNA - accessible to all authenticated users */}
    <Route path="/content-dna" element={<RequireAuth><ContentDNAPage /></RequireAuth>} />
    
    {/* Admin routes - tenant-scoped for university admins */}
    <Route path="/admin" element={<Navigate to="/admin/console" replace />} />
    <Route path="/admin/console" element={<RequireAuth><RequireAdmin><AdminConsolePage /></RequireAdmin></RequireAuth>} />
    <Route path="/admin/users" element={<RequireAuth><RequireAdmin><AdminUsersPage /></RequireAdmin></RequireAuth>} />
    <Route path="/admin/content-dna" element={<RequireAuth><ContentDNAPage /></RequireAuth>} />
    
    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function ImpersonationWrapper() {
  const { isImpersonating, impersonatedUserEmail, exitImpersonation } = useAuth();
  
  if (!isImpersonating || !impersonatedUserEmail) return null;
  
  return (
    <ImpersonationBanner 
      targetUserEmail={impersonatedUserEmail} 
      onExit={exitImpersonation} 
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ImpersonationWrapper />
          <Toaster />
          <Sonner />
          <AppRoutes />
          <FeedbackButton />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
