import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";

interface MobileNavLink {
  label: string;
  href: string;
  variant?: 'default' | 'primary' | 'outline';
}

interface MobileNavProps {
  links?: MobileNavLink[];
}

const defaultLinks: MobileNavLink[] = [
  { label: 'Features', href: '/features/message-builder' },
  { label: 'Content DNA', href: '/features/content-dna' },
  { label: 'Journey Designer', href: '/features/journey-designer' },
  { label: 'Library', href: '/features/library' },
  { label: 'Sign In', href: '/login', variant: 'outline' },
  { label: 'Join Beta', href: '/request-access', variant: 'primary' },
];

export function MobileNav({ links = defaultLinks }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="flex items-center gap-2">
            <img src={campusvoiceLogo} alt="CampusVoice" className="h-6" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
            >
              {link.variant === 'primary' ? (
                <Button className="w-full bg-primary hover:bg-primary/90">
                  {link.label}
                </Button>
              ) : link.variant === 'outline' ? (
                <Button variant="outline" className="w-full">
                  {link.label}
                </Button>
              ) : (
                <Button variant="ghost" className="w-full justify-start">
                  {link.label}
                </Button>
              )}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
