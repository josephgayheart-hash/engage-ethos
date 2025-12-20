/**
 * WaveBackground - A decorative wave SVG overlay for page headers
 * Used on Build and Strategy pages to add visual interest
 */
export function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
      
      {/* Wave SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full h-24 md:h-32"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back wave - more transparent */}
        <path
          d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          className="fill-background/40"
        />
        {/* Middle wave */}
        <path
          d="M0,80 C320,40 640,100 960,60 C1280,20 1360,80 1440,80 L1440,120 L0,120 Z"
          className="fill-background/60"
        />
        {/* Front wave - solid */}
        <path
          d="M0,90 C360,110 720,70 1080,90 C1260,100 1380,85 1440,90 L1440,120 L0,120 Z"
          className="fill-background"
        />
      </svg>
      
      {/* Subtle accent circles */}
      <div className="absolute top-4 right-1/4 w-32 h-32 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute top-8 left-1/3 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}
