import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

export function BrandedLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <img
        src={campusvoiceLogo}
        alt="CampusVoice.AI"
        className="h-8 w-auto opacity-60 animate-pulse"
      />
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
