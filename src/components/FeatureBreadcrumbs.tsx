import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface SiblingLink {
  label: string;
  href: string;
}

interface FeatureBreadcrumbsProps {
  items: BreadcrumbItemType[];
  /** Related tool links shown inline after the breadcrumb trail */
  siblings?: SiblingLink[];
}

export function FeatureBreadcrumbs({ items, siblings }: FeatureBreadcrumbsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="w-3.5 h-3.5" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item, index) => (
            <span key={item.label} className="contents">
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === items.length - 1 || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {siblings && siblings.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-border">|</span>
          <span>also:</span>
          {siblings.map((sibling, i) => (
            <span key={sibling.href} className="contents">
              {i > 0 && <span className="text-border">·</span>}
              <Link
                to={sibling.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {sibling.label}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeatureBreadcrumbs;
