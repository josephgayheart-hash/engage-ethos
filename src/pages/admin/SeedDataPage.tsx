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
  const [isPurging, setIsPurging] = useState(false);
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

  const purgeSeedData = async () => {
    if (!isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only Super Admins can purge seed data',
        variant: 'destructive',
      });
      return;
    }

    setIsPurging(true);
    setResults([]);

    try {
      // Get the seed tenant IDs
      updateResult('find-tenants', 'running', 'Finding seed tenants...');
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, institution_name')
        .in('institution_name', ['University Alpha', 'University Beta']);

      if (!tenants || tenants.length === 0) {
        updateResult('find-tenants', 'success', 'No seed tenants found to purge');
        toast({
          title: 'Nothing to Purge',
          description: 'No seed data found in the database',
        });
        setIsPurging(false);
        return;
      }

      const tenantIds = tenants.map(t => t.id);
      updateResult('find-tenants', 'success', `Found ${tenants.length} seed tenant(s)`);

      // Delete tool usage events
      updateResult('delete-tool-usage', 'running', 'Deleting tool usage events...');
      const { count: toolUsageCount } = await supabase
        .from('tool_usage_events')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-tool-usage', 'success', `Deleted ${toolUsageCount || 0} tool usage events`);

      // Delete content DNA samples
      updateResult('delete-content-dna', 'running', 'Deleting content DNA samples...');
      const { count: contentDNACount } = await supabase
        .from('content_dna_samples')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-content-dna', 'success', `Deleted ${contentDNACount || 0} content DNA samples`);

      // Delete BYOC uploads
      updateResult('delete-byoc', 'running', 'Deleting BYOC uploads...');
      const { count: byocCount } = await supabase
        .from('byoc_uploads')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-byoc', 'success', `Deleted ${byocCount || 0} BYOC uploads`);

      // Delete beta feedback
      updateResult('delete-feedback', 'running', 'Deleting beta feedback...');
      const { count: feedbackCount } = await supabase
        .from('beta_feedback')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-feedback', 'success', `Deleted ${feedbackCount || 0} feedback entries`);

      // Delete institutional profiles
      updateResult('delete-profiles', 'running', 'Deleting institutional profiles...');
      const { count: profilesCount } = await supabase
        .from('institutional_profiles')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-profiles', 'success', `Deleted ${profilesCount || 0} institutional profiles`);

      // Delete institutional config
      updateResult('delete-config', 'running', 'Deleting institutional config...');
      const { count: configCount } = await supabase
        .from('institutional_config')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-config', 'success', `Deleted ${configCount || 0} institutional configs`);

      // Delete user roles
      updateResult('delete-roles', 'running', 'Deleting user roles...');
      const { count: rolesCount } = await supabase
        .from('user_roles')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-roles', 'success', `Deleted ${rolesCount || 0} user roles`);

      // Delete user profiles (not auth users - those would need edge function)
      updateResult('delete-user-profiles', 'running', 'Deleting user profiles...');
      const { count: userProfilesCount } = await supabase
        .from('profiles')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-user-profiles', 'success', `Deleted ${userProfilesCount || 0} user profiles`);

      // Delete invite tokens
      updateResult('delete-invites', 'running', 'Deleting invite tokens...');
      const { count: invitesCount } = await supabase
        .from('invite_tokens')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-invites', 'success', `Deleted ${invitesCount || 0} invite tokens`);

      // Delete audit logs
      updateResult('delete-audit', 'running', 'Deleting audit logs...');
      const { count: auditCount } = await supabase
        .from('audit_log')
        .delete({ count: 'exact' })
        .in('tenant_id', tenantIds);
      updateResult('delete-audit', 'success', `Deleted ${auditCount || 0} audit log entries`);

      // Finally, delete the tenants themselves
      updateResult('delete-tenants', 'running', 'Deleting seed tenants...');
      const { error: tenantDeleteError } = await supabase
        .from('tenants')
        .delete()
        .in('id', tenantIds);
      
      if (tenantDeleteError) throw tenantDeleteError;
      updateResult('delete-tenants', 'success', `Deleted ${tenants.length} seed tenant(s)`);

      updateResult('summary', 'success', 'All seed data purged successfully!');

      toast({
        title: 'Seed Data Purged',
        description: 'All test data has been removed from the database',
      });

    } catch (error: any) {
      console.error('Purge error:', error);
      updateResult('error', 'error', error.message || 'An error occurred');
      toast({
        title: 'Purge Error',
        description: error.message || 'Failed to purge seed data',
        variant: 'destructive',
      });
    } finally {
      setIsPurging(false);
    }
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

      let alphaId: string | null = null;

      if (alphaError) {
        if (alphaError.code === '23505') {
          const { data: existingAlpha } = await supabase
            .from('tenants')
            .select()
            .eq('institution_name', 'University Alpha')
            .single();
          if (existingAlpha) {
            alphaId = existingAlpha.id;
            updateResult('tenant-alpha', 'success', 'University Alpha already exists');
          }
        } else {
          throw alphaError;
        }
      } else {
        alphaId = tenantAlpha.id;
        updateResult('tenant-alpha', 'success', 'University Alpha created successfully');
        
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

      let betaId: string | null = null;

      if (betaError) {
        if (betaError.code === '23505') {
          const { data: existingBeta } = await supabase
            .from('tenants')
            .select()
            .eq('institution_name', 'University Beta')
            .single();
          if (existingBeta) {
            betaId = existingBeta.id;
            updateResult('tenant-beta', 'success', 'University Beta already exists');
          }
        } else {
          throw betaError;
        }
      } else {
        betaId = tenantBeta.id;
        updateResult('tenant-beta', 'success', 'University Beta created successfully');
        
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

      // Step 3: Create sample tool usage events
      if (alphaId && betaId) {
        updateResult('tool-usage', 'running', 'Creating sample tool usage events...');
        
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

        const toolUsageEvents = [];
        const tools = ['message_evaluator', 'message_builder', 'strategy_mapper', 'call_script', 'playground', 'byoc'];
        
        for (const user of alphaUsers || []) {
          for (let i = 0; i < 8; i++) {
            toolUsageEvents.push({
              tenant_id: alphaId,
              user_id: user.id,
              tool_name: tools[Math.floor(Math.random() * tools.length)],
              action: 'use',
              metadata: { generated_at: new Date().toISOString(), is_seed_data: true }
            });
          }
        }

        for (const user of betaUsers || []) {
          for (let i = 0; i < 5; i++) {
            toolUsageEvents.push({
              tenant_id: betaId,
              user_id: user.id,
              tool_name: tools[Math.floor(Math.random() * tools.length)],
              action: 'use',
              metadata: { generated_at: new Date().toISOString(), is_seed_data: true }
            });
          }
        }

        if (toolUsageEvents.length > 0) {
          const { error: toolError } = await supabase.from('tool_usage_events').insert(toolUsageEvents);
          if (toolError) {
            updateResult('tool-usage', 'error', `Error: ${toolError.message}`);
          } else {
            updateResult('tool-usage', 'success', `Created ${toolUsageEvents.length} tool usage events`);
          }
        } else {
          updateResult('tool-usage', 'success', 'No users found in seed tenants - create users first via Admin');
        }
      }

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

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      Generate Seed Data
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create test institutions and sample data
                    </p>
                  </div>
                  <Button 
                    onClick={generateSeedData} 
                    disabled={isSeeding || isPurging}
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
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 text-red-700">
                      <Trash2 className="w-4 h-4" />
                      Purge Seed Data
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Remove University Alpha & Beta and all related data
                    </p>
                  </div>
                  <Button 
                    onClick={purgeSeedData} 
                    disabled={isSeeding || isPurging}
                    variant="destructive"
                    className="gap-2"
                  >
                    {isPurging ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Purging...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Purge Seed Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Progress</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
