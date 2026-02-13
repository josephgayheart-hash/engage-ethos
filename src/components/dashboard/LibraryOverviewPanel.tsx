import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyMode } from '@/hooks/useAgencyMode';
import { useLibraryCollections } from '@/hooks/useLibraryCollections';
import {
  BookOpen,
  FolderOpen,
  Folder,
  Building2,
  ChevronRight,
  FileText,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface LibraryCounts {
  personalMessages: number;
  sharedTemplates: number;
}

export function LibraryOverviewPanel() {
  const { user, tenant, isAdmin } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const navigate = useNavigate();
  const { collections } = useLibraryCollections();
  const [counts, setCounts] = useState<LibraryCounts>({ personalMessages: 0, sharedTemplates: 0 });
  const [loading, setLoading] = useState(true);

  const primaryColor = tenant?.primary_color || 'hsl(var(--primary))';
  const accentColor = tenant?.accent_color || 'hsl(var(--accent))';
  const universityLabel = isAgency ? labels.profileTerm : 'University';
  const libraryLabel = isAgency ? 'Template Library' : 'University Library';
  const activeCollections = collections.filter(c => c.status === 'active');

  useEffect(() => {
    if (!user?.id || !tenant?.id) {
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      const [personalRes, sharedRes] = await Promise.all([
        supabase
          .from('personal_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('shared_templates')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .in('status', ['published', 'approved']),
      ]);

      setCounts({
        personalMessages: personalRes.count || 0,
        sharedTemplates: sharedRes.count || 0,
      });
      setLoading(false);
    };

    fetchCounts();
  }, [user?.id, tenant?.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Library & Collections
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Personal Library Card */}
        <Card
          className="group cursor-pointer hover:shadow-md transition-all border-border/60"
          onClick={() => navigate('/library')}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-serif font-semibold text-sm">My Library</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Saved content & images</p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif">{counts.personalMessages}</span>
              <span className="text-xs text-muted-foreground">
                item{counts.personalMessages !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* University Library Card — branded */}
        <Card
          className="group cursor-pointer hover:shadow-md transition-all overflow-hidden border-border/60"
          onClick={() => navigate('/shared-library')}
        >
          {/* Tenant brand accent strip */}
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
          />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Avatar className="h-10 w-10 rounded-lg border border-border/50">
                {tenant?.logo_url ? (
                  <AvatarImage
                    src={tenant.logo_url}
                    alt={tenant.institution_name || universityLabel}
                    className="object-contain p-0.5"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg bg-muted">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-serif font-semibold text-sm" style={{ color: primaryColor }}>
              {libraryLabel}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {tenant?.institution_name || 'Approved playbooks'}
            </p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif">{counts.sharedTemplates}</span>
              <span className="text-xs text-muted-foreground">
                playbook{counts.sharedTemplates !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Collections Card */}
        <Card
          className="group cursor-pointer hover:shadow-md transition-all border-border/60"
          onClick={() => navigate('/shared-library?tab=collections')}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Folder className="w-5 h-5 text-secondary" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-serif font-semibold text-sm">Collections</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Campaigns & initiatives</p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif">{activeCollections.length}</span>
              <span className="text-xs text-muted-foreground">
                active collection{activeCollections.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection previews — show up to 3 recent active collections */}
      {activeCollections.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Collections</p>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link to="/shared-library?tab=collections">
                View All <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeCollections.slice(0, 3).map(col => (
              <Card
                key={col.id}
                className="group cursor-pointer hover:shadow-sm transition-shadow border-border/50"
                onClick={() => navigate(`/collections/${col.id}`)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                    {col.coverImageUrl ? (
                      <img src={col.coverImageUrl} alt="" className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Folder className="w-4 h-4 text-primary/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{col.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {col.collectionType}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {col.itemCount || 0} item{(col.itemCount || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
