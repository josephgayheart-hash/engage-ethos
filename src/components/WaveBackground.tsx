/**
 * WaveBackground - A decorative wave SVG overlay for page headers
 * Used on Build and Strategy pages to add visual interest
 */
export function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Strong gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/15" />
      
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary/50 to-secondary" />
      
      {/* Wave SVG at bottom - more prominent */}
      <svg
        className="absolute -bottom-1 left-0 w-full h-20 md:h-28"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back wave - teal accent, more visible */}
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,100 L0,100 Z"
          className="fill-accent/25"
        />
        {/* Middle wave - primary color */}
        <path
          d="M0,45 C320,25 640,55 960,35 C1280,15 1360,45 1440,45 L1440,100 L0,100 Z"
          className="fill-primary/10"
        />
        {/* Front wave - background blend */}
        <path
          d="M0,60 C360,75 720,50 1080,60 C1260,65 1380,55 1440,60 L1440,100 L0,100 Z"
          className="fill-background"
        />
      </svg>
      
      {/* Visible accent orbs */}
      <div className="absolute top-4 right-1/4 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute top-2 left-1/4 w-40 h-40 rounded-full bg-secondary/20 blur-2xl" />
      <div className="absolute top-8 left-1/2 w-32 h-32 rounded-full bg-primary/10 blur-xl" />
    </div>
  );
}
