import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Settings, 
  FileText, 
  Shield,
  Home,
  ChevronRight,
  Building2
} from 'lucide-react';

export default function AdminConsolePage() {
  const { tenant, profile } = useAuth();

  const adminLinks = [
    {
      title: 'User Management',
      description: 'Create, edit, and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-[hsl(222,47%,14%)]',
    },
    {
      title: 'Onboarding Requests',
      description: 'Review and approve access requests',
      icon: UserPlus,
      href: '/admin/onboarding',
      color: 'bg-[hsl(173,58%,39%)]',
    },
    {
      title: 'Shared Library',
      description: 'Manage templates and playbooks',
      icon: FileText,
      href: '/admin/library',
      color: 'bg-[hsl(45,93%,47%)]',
    },
    {
      title: 'Institution Settings',
      description: 'Configure voice, lexicon, and branding',
      icon: Settings,
      href: '/settings',
      color: 'bg-[hsl(262,52%,47%)]',
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)] mb-2">
            <Link to="/" className="hover:text-[hsl(222,47%,11%)]">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <span className="text-[hsl(222,47%,11%)]">Admin Console</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">Admin Console</h1>
              <p className="text-[hsl(220,14%,46%)]">Manage your institution's PERSIST settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {tenant?.institution_name || 'Loading...'}
              </Badge>
              <Badge className="bg-[hsl(222,47%,14%)]">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 border-[hsl(220,13%,88%)] bg-gradient-to-r from-[hsl(222,47%,14%)] to-[hsl(222,47%,20%)] text-white">
          <CardContent className="py-6">
            <h2 className="font-serif text-xl font-bold mb-2">
              Welcome, {profile?.first_name}
            </h2>
            <p className="text-white/80">
              As an administrator, you can manage users, review access requests, and configure institution settings.
            </p>
          </CardContent>
        </Card>

        {/* Admin Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Card className="h-full border-[hsl(220,13%,88%)] hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${link.color} text-white`}>
                      <link.icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[hsl(220,14%,46%)] group-hover:text-[hsl(222,47%,11%)] transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-1 text-[hsl(222,47%,11%)]">{link.title}</CardTitle>
                  <CardDescription className="text-[hsl(220,14%,46%)]">{link.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[hsl(222,47%,14%)]/10">
                  <Users className="w-6 h-6 text-[hsl(222,47%,14%)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">—</p>
                  <p className="text-sm text-[hsl(220,14%,46%)]">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[hsl(173,58%,39%)]/10">
                  <UserPlus className="w-6 h-6 text-[hsl(173,58%,39%)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">—</p>
                  <p className="text-sm text-[hsl(220,14%,46%)]">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[hsl(45,93%,47%)]/10">
                  <FileText className="w-6 h-6 text-[hsl(45,93%,47%)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">—</p>
                  <p className="text-sm text-[hsl(220,14%,46%)]">Shared Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}