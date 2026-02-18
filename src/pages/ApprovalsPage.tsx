import { Link } from "react-router-dom";
import { AdminApprovalPanel } from "@/components/library/AdminApprovalPanel";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ApprovalsPage = () => {
  const { templates, updateTemplateStatus, isLoading } = useSharedLibrary();
  const { profile, tenant } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Library Approvals</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Library Approvals
                </h1>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Approver
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Review and approve templates submitted to the shared library
              </p>
              {tenant && (
                <p className="text-sm text-muted-foreground mt-1">
                  {tenant.institution_name}
                </p>
              )}
            </div>
          </div>

          {/* Approval Panel */}
          <AdminApprovalPanel 
            templates={templates} 
            onUpdateStatus={updateTemplateStatus} 
          />
        </div>
      </main>
    </div>
  );
};

export default ApprovalsPage;
