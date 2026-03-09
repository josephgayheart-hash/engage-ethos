import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FeedbackButton } from "@/components/FeedbackButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { usePageTracking } from "@/hooks/usePageTracking";
import { AppLayout } from "@/components/app-shell/AppLayout";
import { BrandedLoader } from "@/components/BrandedLoader";

// Page imports
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
import UniversitySettingsPage from "./pages/UniversitySettingsPage";
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
import SecurityEventsPage from "./pages/admin/SecurityEventsPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import InitialSetupPage from "./pages/InitialSetupPage";
import MessageDetailPage from "./pages/MessageDetailPage";
import TemplateDetailPage from "./pages/TemplateDetailPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import BetaFeedbackPage from "./pages/BetaFeedbackPage";
import ContentDNAFeaturePage from "./pages/features/ContentDNAFeaturePage";
import MessageBuilderFeaturePage from "./pages/features/MessageBuilderFeaturePage";
import JourneyDesignerFeaturePage from "./pages/features/JourneyDesignerFeaturePage";
import EvaluateFeaturePage from "./pages/features/EvaluateFeaturePage";
import LibraryFeaturePage from "./pages/features/LibraryFeaturePage";
import ImageStudioFeaturePage from "./pages/features/ImageStudioFeaturePage";
import BrandStudioFeaturePage from "./pages/features/BrandStudioFeaturePage";
import AICopywriterFeaturePage from "./pages/features/AICopywriterFeaturePage";
import BrandAuditFeaturePage from "./pages/features/BrandAuditFeaturePage";
import WebCrawlFeaturePage from "./pages/features/WebCrawlFeaturePage";
import OGPreviewPage from "./pages/OGPreviewPage";
import WebContentAnalyzerPage from "./pages/WebContentAnalyzerPage";
import BrandAuditPage from "./pages/BrandAuditPage";
import ForAgenciesPage from "./pages/agency/ForAgenciesPage";
import AgencyRequestAccessPage from "./pages/agency/AgencyRequestAccessPage";
import AgencyOnboardingPage from "./pages/agency/AgencyOnboardingPage";
import AgencyDashboardPage from "./pages/agency/AgencyDashboardPage";
import AgencyClientsPage from "./pages/agency/AgencyClientsPage";
import AgencyAnalyticsPage from "./pages/agency/AgencyAnalyticsPage";
import UniversityDashboardPage from "./pages/UniversityDashboardPage";
import ToolsPage from "./pages/ToolsPage";
import ImageGeneratorPage from "./pages/ImageGeneratorPage";
import BrandStudioPage from "./pages/BrandStudioPage";
import ProspectOutreachPage from "./pages/ProspectOutreachPage";
import CRMPage from "./pages/CRMPage";
import NDALinksPage from "./pages/admin/NDALinksPage";
import NDASignPage from "./pages/NDASignPage";

const queryClient = new QueryClient();

function PageTracker() {
  usePageTracking();
  return null;
}

// Protected route wrapper
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.password_reset_required) return <Navigate to="/change-password" replace />;
  if (profile?.status !== 'active' && profile?.status !== 'invited') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireApprover({ children }: { children: React.ReactNode }) {
  const { isApprover, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  if (!isApprover) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  if (user && profile?.status === 'active' && !profile?.password_reset_required) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes — no sidebar */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/og-preview" element={<OGPreviewPage />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/request-access" element={<RequestAccessPage />} />
    <Route path="/change-password" element={<ChangePasswordPage />} />
    <Route path="/setup" element={<InitialSetupPage />} />
    <Route path="/for-agencies" element={<ForAgenciesPage />} />
    <Route path="/agency/request-access" element={<AgencyRequestAccessPage />} />
    <Route path="/features/content-dna" element={<ContentDNAFeaturePage />} />
    <Route path="/features/message-builder" element={<MessageBuilderFeaturePage />} />
    <Route path="/features/journey-designer" element={<JourneyDesignerFeaturePage />} />
    <Route path="/features/evaluate" element={<EvaluateFeaturePage />} />
    <Route path="/features/library" element={<LibraryFeaturePage />} />
    <Route path="/features/image-studio" element={<ImageStudioFeaturePage />} />
    <Route path="/features/brand-studio" element={<BrandStudioFeaturePage />} />
    <Route path="/features/ai-copywriter" element={<AICopywriterFeaturePage />} />
    <Route path="/features/brand-audit" element={<BrandAuditFeaturePage />} />
    <Route path="/features/webcrawl" element={<WebCrawlFeaturePage />} />
    <Route path="/nda/sign/:slug" element={<NDASignPage />} />

    {/* Authenticated routes — wrapped in AppLayout sidebar shell */}
    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route path="/dashboard" element={<Index />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/feedback" element={<BetaFeedbackPage />} />
      <Route path="/evaluate" element={<EvaluatePage />} />
      <Route path="/build" element={<BuildPage />} />
      <Route path="/strategy" element={<StrategyPage />} />
      <Route path="/call-script" element={<CallScriptPage />} />
      <Route path="/playground" element={<PlaygroundPage />} />
      <Route path="/byoc" element={<BYOCPage />} />
      <Route path="/library" element={<PersonalLibrary />} />
      <Route path="/library/:id" element={<MessageDetailPage />} />
      <Route path="/shared-library" element={<SharedLibrary />} />
      <Route path="/shared-library/:id" element={<TemplateDetailPage />} />
      <Route path="/collections/:id" element={<CollectionDetailPage />} />
      <Route path="/campaign-dashboard" element={<CampaignDashboard />} />
      <Route path="/calendar" element={<CommunicationCalendar />} />
      <Route path="/subject-optimizer" element={<SubjectLineOptimizer />} />
      <Route path="/accessibility" element={<AccessibilityChecker />} />
      <Route path="/brand-voice" element={<BrandVoiceScorer />} />
      <Route path="/email-preview" element={<EmailPreview />} />
      <Route path="/benchmarks" element={<PerformanceBenchmarks />} />
      <Route path="/translate" element={<TranslationTool />} />
      <Route path="/web-analyzer" element={<WebContentAnalyzerPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/image-generator" element={<ImageGeneratorPage />} />
      <Route path="/brand-audit" element={<BrandAuditPage />} />
      <Route path="/brand-studio" element={<BrandStudioPage />} />
      <Route path="/settings" element={<Navigate to="/university-settings" replace />} />
      <Route path="/university-settings" element={<UniversitySettingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/content-dna" element={<ContentDNAPage />} />

      {/* Agency authenticated routes */}
      <Route path="/agency/onboarding" element={<AgencyOnboardingPage />} />
      <Route path="/agency/dashboard" element={<AgencyDashboardPage />} />
      <Route path="/agency/clients" element={<AgencyClientsPage />} />
      <Route path="/agency/analytics" element={<AgencyAnalyticsPage />} />

      {/* Approver routes */}
      <Route path="/approvals" element={<RequireApprover><ApprovalsPage /></RequireApprover>} />

      {/* Admin routes */}
      <Route path="/admin" element={<Navigate to="/admin/console" replace />} />
      <Route element={<RequireAdmin><Outlet /></RequireAdmin>}>
        <Route path="/admin/console" element={<AdminConsolePage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/content-dna" element={<ContentDNAPage />} />
        <Route path="/institution-dashboard" element={<UniversityDashboardPage />} />
      </Route>

      {/* Super Admin routes */}
      <Route element={<RequireSuperAdmin><Outlet /></RequireSuperAdmin>}>
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/admin/onboarding" element={<AdminOnboardingPage />} />
        <Route path="/admin/qa" element={<QADiagnosticsPage />} />
        <Route path="/admin/seed" element={<SeedDataPage />} />
        <Route path="/admin/security-events" element={<SecurityEventsPage />} />
        <Route path="/admin/institution/:id" element={<InstitutionDetailPage />} />
        <Route path="/admin/user/:id" element={<UserDetailPage />} />
        <Route path="/admin/prospect-outreach" element={<ProspectOutreachPage />} />
        <Route path="/admin/crm" element={<CRMPage />} />
        <Route path="/admin/nda-links" element={<NDALinksPage />} />
      </Route>
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <PageTracker />
          <ScrollToTop />
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
