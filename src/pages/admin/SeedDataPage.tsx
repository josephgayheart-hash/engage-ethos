import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  Database,
  Users,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SeedResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
}

export default function SeedDataPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);

  const updateResult = (step: string, status: SeedResult['status'], message: string) => {
    setResults(prev => {
      const existing = prev.find(r => r.step === step);
      if (existing) {
        return prev.map(r => r.step === step ? { ...r, status, message } : r);
      }
      return [...prev, { step, status, message }];
    });
  };

  const generateSeedData = async () => {
    if (!isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only Super Admins can generate seed data',
        variant: 'destructive',
      });
      return;
    }

    setIsSeeding(true);
    setResults([]);

    try {
      // Step 1: Create University Alpha tenant
      updateResult('tenant-alpha', 'running', 'Creating University Alpha...');
      const { data: tenantAlpha, error: alphaError } = await supabase
        .from('tenants')
        .insert({
          institution_name: 'University Alpha',
          status: 'active',
          primary_color: '#1F2A44',
          accent_color: '#2C7A7B',
        })
        .select()
        .single();

      if (alphaError) {
        if (alphaError.code === '23505') {
          // Already exists, fetch it
          const { data: existingAlpha } = await supabase
            .from('tenants')
            .select()
            .eq('institution_name', 'University Alpha')
            .single();
          if (existingAlpha) {
            updateResult('tenant-alpha', 'success', 'University Alpha already exists');
          }
        } else {
          throw alphaError;
        }
      } else {
        updateResult('tenant-alpha', 'success', 'University Alpha created successfully');
        
        // Create institutional config for Alpha
        await supabase.from('institutional_config').insert({
          tenant_id: tenantAlpha.id,
          config: {
            institutionName: 'University Alpha',
            mascot: 'Alpha Eagles',
            primaryColor: '#1F2A44',
            accentColor: '#2C7A7B',
          }
        });
      }

      // Step 2: Create University Beta tenant
      updateResult('tenant-beta', 'running', 'Creating University Beta...');
      const { data: tenantBeta, error: betaError } = await supabase
        .from('tenants')
        .insert({
          institution_name: 'University Beta',
          status: 'active',
          primary_color: '#4A1D96',
          accent_color: '#D97706',
        })
        .select()
        .single();

      if (betaError) {
        if (betaError.code === '23505') {
          const { data: existingBeta } = await supabase
            .from('tenants')
            .select()
            .eq('institution_name', 'University Beta')
            .single();
          if (existingBeta) {
            updateResult('tenant-beta', 'success', 'University Beta already exists');
          }
        } else {
          throw betaError;
        }
      } else {
        updateResult('tenant-beta', 'success', 'University Beta created successfully');
        
        // Create institutional config for Beta
        await supabase.from('institutional_config').insert({
          tenant_id: tenantBeta.id,
          config: {
            institutionName: 'University Beta',
            mascot: 'Beta Bears',
            primaryColor: '#4A1D96',
            accentColor: '#D97706',
          }
        });
      }

      // Get tenant IDs for user creation
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, institution_name')
        .in('institution_name', ['University Alpha', 'University Beta']);

      const alphaId = tenants?.find(t => t.institution_name === 'University Alpha')?.id;
      const betaId = tenants?.find(t => t.institution_name === 'University Beta')?.id;

      // Step 3: Create sample tool usage events
      if (alphaId && betaId) {
        updateResult('tool-usage', 'running', 'Creating sample tool usage events...');
        
        // Get existing users for the tenants
        const { data: alphaUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('tenant_id', alphaId)
          .limit(3);

        const { data: betaUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('tenant_id', betaId)
          .limit(3);

        // Create tool usage events for existing users
        const toolUsageEvents = [];
        const tools = ['message_evaluator', 'message_builder', 'strategy_mapper', 'call_script', 'playground'];
        
        for (const user of alphaUsers || []) {
          for (let i = 0; i < 5; i++) {
            toolUsageEvents.push({
              tenant_id: alphaId,
              user_id: user.id,
              tool_name: tools[Math.floor(Math.random() * tools.length)],
              action: 'use',
              metadata: { generated_at: new Date().toISOString() }
            });
          }
        }

        for (const user of betaUsers || []) {
          for (let i = 0; i < 3; i++) {
            toolUsageEvents.push({
              tenant_id: betaId,
              user_id: user.id,
              tool_name: tools[Math.floor(Math.random() * tools.length)],
              action: 'use',
              metadata: { generated_at: new Date().toISOString() }
            });
          }
        }

        if (toolUsageEvents.length > 0) {
          await supabase.from('tool_usage_events').insert(toolUsageEvents);
          updateResult('tool-usage', 'success', `Created ${toolUsageEvents.length} tool usage events`);
        } else {
          updateResult('tool-usage', 'success', 'No users found - skipping tool usage events');
        }
      }

      // Step 4: Summary
      updateResult('summary', 'success', 'Seed data generation complete!');

      toast({
        title: 'Seed Data Created',
        description: 'Test tenants and sample data have been generated',
      });

    } catch (error: any) {
      console.error('Seed data error:', error);
      updateResult('error', 'error', error.message || 'An error occurred');
      toast({
        title: 'Seed Data Error',
        description: error.message || 'Failed to generate seed data',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const getStatusIcon = (status: SeedResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Database className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/admin/panel" className="hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Super Admin Panel
            </Link>
            <span>/</span>
            <span className="text-foreground">Seed Data Generator</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold mb-2">Seed Data Generator</h1>
            <p className="text-muted-foreground">
              Generate test institutions and sample data for QA testing
            </p>
          </div>

          {/* Warning */}
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              This will create test data in your database. Use only in development/staging environments.
            </AlertDescription>
          </Alert>

          {/* What will be created */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                What will be created
              </CardTitle>
              <CardDescription>
                The seed generator will create the following test data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-primary" />
                    Test Institutions
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">Alpha</Badge>
                      University Alpha (Eagle mascot)
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-50">Beta</Badge>
                      University Beta (Bear mascot)
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    Sample Data
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Institutional configuration</li>
                    <li>• Tool usage events</li>
                    <li>• Activity metrics per tenant</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  User Accounts (Created via Admin Panel)
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  User accounts should be created manually through the Admin Panel to properly set up authentication:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Admin Alpha</strong> - University Admin for University Alpha</li>
                  <li>• <strong>User Alpha 1 & 2</strong> - Standard users for University Alpha</li>
                  <li>• <strong>Admin Beta</strong> - University Admin for University Beta</li>
                  <li>• <strong>User Beta 1</strong> - Standard user for University Beta</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Generate Seed Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Create test institutions and sample data
                  </p>
                </div>
                <Button 
                  onClick={generateSeedData} 
                  disabled={isSeeding}
                  className="gap-2"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Generate Seed Data
                    </>
                  )}
                </Button>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Progress</h4>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{result.step}</div>
                          <div className="text-xs text-muted-foreground">{result.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
