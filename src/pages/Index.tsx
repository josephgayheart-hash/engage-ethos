import { Header } from "@/components/Header";
import { DashboardHero } from "@/components/dashboard";
import { ScratchpadCapture } from "@/components/dashboard/ScratchpadCapture";
import { ResumeWorkCard } from "@/components/dashboard/ResumeWorkCard";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { MyDraftsCard } from "@/components/MyDraftsCard";
import { RecentMessagesPanel } from "@/components/dashboard/RecentMessagesPanel";
import { ContentDNAStatusCard } from "@/components/dashboard/ContentDNAStatusCard";
import { InstitutionManagementCard } from "@/components/dashboard/InstitutionManagementCard";
import { AdminTeamOverview } from "@/components/dashboard/AdminTeamOverview";
import { QuickLaunchBar } from "@/components/dashboard/QuickLaunchBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dynamic Hero Section */}
      <DashboardHero />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Quick Capture Scratchpad */}
          <ScratchpadCapture />

          {/* Resume Where You Left Off */}
          <ResumeWorkCard />

          {/* Core Actions — prominent for new users, dismissible */}
          <QuickActionsPanel />
          
          {/* My Drafts - Promoted to full width */}
          <section id="my-drafts">
            <MyDraftsCard />
          </section>

          {/* Recent Messages + Management Panel */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <RecentMessagesPanel />
            </div>
            <div className="space-y-6">
              <InstitutionManagementCard />
              <ContentDNAStatusCard />
            </div>
          </section>

          {/* Admin Team Overview - University Admins Only */}
          <AdminTeamOverview />

          {/* Quick Launch Bar */}
          <QuickLaunchBar />
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              CampusVoice — Your Voice for Student Success
            </p>
            <a 
              href="mailto:support@campusvoice.ai" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Need help? support@campusvoice.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
