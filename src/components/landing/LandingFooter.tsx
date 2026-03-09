import { Link } from 'react-router-dom';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Message Builder', to: '/features/message-builder' },
      { label: 'Journey Designer', to: '/features/journey-designer' },
      { label: 'Content DNA', to: '/features/content-dna' },
      { label: 'Library', to: '/features/library' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'For Universities', to: '/' },
      { label: 'For Agencies', to: '/for-agencies' },
      { label: 'Request Access', to: '/request-access' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  },
];

export function LandingFooter({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const isDark = variant === 'dark';

  return (
    <footer
      className={`py-14 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-primary' : 'border-t bg-background'}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <img
              src={campusvoiceLogo}
              alt="CampusVoice.AI"
              className={`h-7 w-auto max-w-[140px] mb-3 ${isDark ? 'brightness-0 invert opacity-90' : 'opacity-70'}`}
            />
            <p className={`text-xs leading-relaxed ${isDark ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
              Research-grounded messaging intelligence for higher education.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={`text-sm transition-colors ${isDark ? 'text-primary-foreground/50 hover:text-primary-foreground/80' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={`border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 ${isDark ? 'border-primary-foreground/10' : 'border-border'}`}>
          <span className={`text-xs ${isDark ? 'text-primary-foreground/40' : 'text-muted-foreground'}`}>
            © 2026 CampusVoice.AI. All rights reserved.
          </span>
          <a
            href="mailto:sales@campusvoice.ai"
            className={`text-xs transition-colors ${isDark ? 'text-primary-foreground/40 hover:text-primary-foreground/70' : 'text-muted-foreground hover:text-foreground'}`}
          >
            sales@campusvoice.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
