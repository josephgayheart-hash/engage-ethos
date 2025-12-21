import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

interface OGImagePreviewProps {
  onExport?: () => void;
}

export function OGImagePreview({ onExport }: OGImagePreviewProps) {
  return (
    <div 
      id="og-image-container"
      className="relative overflow-hidden"
      style={{ 
        width: '1200px', 
        height: '630px',
        background: 'linear-gradient(135deg, hsl(222 47% 8%) 0%, hsl(222 47% 4%) 50%, hsl(222 47% 6%) 100%)'
      }}
    >
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Glow orbs */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(var(--cyber-lime)) 0%, transparent 70%)',
          top: '-200px',
          left: '-100px',
          filter: 'blur(80px)'
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, hsl(var(--cyber-purple)) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-50px',
          filter: 'blur(80px)'
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, hsl(var(--cyber-blue)) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-16">
        {/* Logo */}
        <img 
          src={campusvoiceLogo} 
          alt="CampusVoice.AI" 
          className="h-24 w-auto mb-8"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))' }}
        />
        
        {/* Tagline */}
        <p 
          className="text-2xl font-medium tracking-wide text-center"
          style={{ 
            color: 'rgba(255, 255, 255, 0.85)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}
        >
          Strategic Messaging Intelligence for Higher Education
        </p>
        
        {/* Subtle accent line */}
        <div 
          className="mt-8 h-1 w-32 rounded-full"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--cyber-lime)), hsl(var(--cyber-purple)), hsl(var(--cyber-blue)))'
          }}
        />
        
        {/* Beta badge */}
        <div 
          className="mt-6 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.7)'
          }}
        >
          Private Beta
        </div>
      </div>

      {/* Bottom wave accent */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-20 opacity-30"
        viewBox="0 0 1200 80" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--cyber-lime))" />
            <stop offset="50%" stopColor="hsl(var(--cyber-purple))" />
            <stop offset="100%" stopColor="hsl(var(--cyber-blue))" />
          </linearGradient>
        </defs>
        <path 
          d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z" 
          fill="url(#waveGradient)"
        />
      </svg>
    </div>
  );
}
