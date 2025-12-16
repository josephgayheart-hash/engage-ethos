import { Header } from "@/components/Header";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const SettingsPage = () => {
  const { config, updateConfig } = useInstitutionalConfig();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold">Institutional Settings</h1>
                <p className="text-muted-foreground text-sm">
                  Configure your institution's voice, terminology, and branding
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Configuration</CardTitle>
              <CardDescription>
                These settings apply globally across all message generation, evaluation, and strategy tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstitutionalConfig config={config} onChange={updateConfig} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
