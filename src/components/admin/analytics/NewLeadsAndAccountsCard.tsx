import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, UserPlus, ArrowRight } from 'lucide-react';

interface Lead {
  id: string;
  university_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_title: string | null;
  status: string | null;
  discovered_at: string;
}

interface Account {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string | null;
  created_at: string;
  tenant_id: string | null;
  tenants?: { institution_name: string | null } | null;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

function useNewLeads() {
  return useQuery({
    queryKey: ['admin-new-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_prospects')
        .select('id, university_name, contact_name, contact_email, contact_title, status, discovered_at')
        .order('discovered_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as Lead[];
    },
  });
}

function useNewAccounts() {
  return useQuery({
    queryKey: ['admin-new-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, status, created_at, tenant_id, tenants(institution_name)')
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as Account[];
    },
  });
}

const Rows = ({ count }: { count: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);

export function NewLeadsAndAccountsCard() {
  const { data: leads, isLoading: leadsLoading } = useNewLeads();
  const { data: accounts, isLoading: accountsLoading } = useNewAccounts();

  const inboundCount = (leads ?? []).filter((l) => l.status === 'inbound').length;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Inbox className="w-4 h-4 text-primary" />
                Inbound Leads
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Every request and question lands here instantly
              </CardDescription>
            </div>
            {inboundCount > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20">{inboundCount} new</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {leadsLoading ? (
            <Rows count={4} />
          ) : (leads ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No leads yet.</p>
          ) : (
            (leads ?? []).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {lead.contact_name || lead.contact_email || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.university_name || '—'}
                    {lead.contact_title ? ` · ${lead.contact_title}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {lead.status === 'inbound' && (
                    <Badge variant="outline" className="text-[10px] capitalize">inbound</Badge>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(lead.discovered_at)}</span>
                </div>
              </div>
            ))
          )}
          <Button variant="ghost" size="sm" className="w-full justify-between mt-2" asChild>
            <Link to="/admin/crm">
              Open CRM
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            New Accounts
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            People who signed themselves up and are already in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {accountsLoading ? (
            <Rows count={4} />
          ) : (accounts ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No accounts yet.</p>
          ) : (
            (accounts ?? []).map((acct) => (
              <div key={acct.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {[acct.first_name, acct.last_name].filter(Boolean).join(' ') || acct.email || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {acct.tenants?.institution_name || acct.email || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] capitalize">{acct.status || 'active'}</Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(acct.created_at)}</span>
                </div>
              </div>
            ))
          )}
          <Button variant="ghost" size="sm" className="w-full justify-between mt-2" asChild>
            <Link to="/admin/users">
              Manage users
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
