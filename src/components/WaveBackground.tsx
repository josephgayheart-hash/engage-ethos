/**
 * WaveBackground - A decorative wave SVG overlay for page headers
 * Used on Build and Strategy pages to add visual interest
 */
export function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-primary/5 to-secondary/8" />
      
      {/* Decorative top wave accent line */}
      <svg
        className="absolute top-0 left-0 w-full h-2"
        viewBox="0 0 1440 8"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,4 C360,8 720,0 1080,4 C1260,6 1380,2 1440,4 L1440,0 L0,0 Z"
          className="fill-accent/30"
        />
      </svg>
      
      {/* Wave SVG at bottom */}
      <svg
        className="absolute -bottom-1 left-0 w-full h-16 md:h-24"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back wave - teal accent */}
        <path
          d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z"
          className="fill-accent/10"
        />
        {/* Middle wave - blend */}
        <path
          d="M0,50 C320,30 640,60 960,40 C1280,20 1360,50 1440,50 L1440,80 L0,80 Z"
          className="fill-background/70"
        />
        {/* Front wave - solid background */}
        <path
          d="M0,60 C360,75 720,50 1080,60 C1260,65 1380,55 1440,60 L1440,80 L0,80 Z"
          className="fill-background"
        />
      </svg>
      
      {/* Subtle accent orbs */}
      <div className="absolute top-6 right-1/4 w-40 h-40 rounded-full bg-accent/8 blur-3xl" />
      <div className="absolute top-4 left-1/3 w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
      <div className="absolute bottom-8 right-1/3 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
    </div>
  );
}
