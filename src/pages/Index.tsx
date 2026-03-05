import { DashboardHero } from "@/components/dashboard";
import { ScratchpadCapture } from "@/components/dashboard/ScratchpadCapture";
import { ResumeWorkCard } from "@/components/dashboard/ResumeWorkCard";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { MyDraftsCard } from "@/components/MyDraftsCard";

import { ContentDNAStatusCard } from "@/components/dashboard/ContentDNAStatusCard";
import { InstitutionManagementCard } from "@/components/dashboard/InstitutionManagementCard";
import { AdminTeamOverview } from "@/components/dashboard/AdminTeamOverview";
import { QuickLaunchBar } from "@/components/dashboard/QuickLaunchBar";
import { LibraryOverviewPanel } from "@/components/dashboard/LibraryOverviewPanel";

const Index = () => {
  return (
    <div className="bg-background">
      <DashboardHero />

      <main className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <ScratchpadCapture />
          <ResumeWorkCard />
          <QuickActionsPanel />
          
          <section id="my-drafts">
            <MyDraftsCard />
          </section>

          <LibraryOverviewPanel />

          <section className="grid md:grid-cols-2 gap-4">
            <InstitutionManagementCard />
            <ContentDNAStatusCard />
          </section>

          <AdminTeamOverview />
          <QuickLaunchBar />
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-[11px] text-muted-foreground">
              CampusVoice — Your Voice for Student Success
            </p>
            <a 
              href="mailto:support@campusvoice.ai" 
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              support@campusvoice.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
