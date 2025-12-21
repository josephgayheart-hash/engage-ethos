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
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 25%, #fef3f0 50%, #f0f7ff 75%, #f5f0ff 100%)'
      }}
    >
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,120,180,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,120,180,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Pastel sprite orbs - blurred */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0) 70%)',
          top: '-100px',
          left: '-50px',
          filter: 'blur(60px)'
        }}
      />
      <div 
        className="absolute rounded-full"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, rgba(251, 146, 60, 0) 70%)',
          top: '60%',
          left: '15%',
          filter: 'blur(50px)'
        }}
      />
      <div 
        className="absolute rounded-full"
        style={{
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(56, 189, 248, 0) 70%)',
          top: '-80px',
          right: '10%',
          filter: 'blur(70px)'
        }}
      />
      <div 
        className="absolute rounded-full"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(52, 211, 153, 0) 70%)',
          bottom: '-50px',
          right: '-30px',
          filter: 'blur(55px)'
        }}
      />
      <div 
        className="absolute rounded-full"
        style={{
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, rgba(244, 114, 182, 0) 70%)',
          bottom: '20%',
          left: '40%',
          filter: 'blur(45px)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-16">
        {/* Logo */}
        <img 
          src={campusvoiceLogo} 
          alt="CampusVoice.AI" 
          className="h-28 w-auto mb-8"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))' }}
        />
        
        {/* Tagline */}
        <p 
          className="text-2xl font-medium tracking-wide text-center"
          style={{ 
            color: '#374151',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          Strategic Messaging Intelligence for Higher Education
        </p>
        
        {/* Subtle accent line */}
        <div 
          className="mt-8 h-1 w-32 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #a78bfa, #f472b6, #38bdf8)'
          }}
        />
        
        {/* Beta badge */}
        <div 
          className="mt-6 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            color: '#6b7280',
            backdropFilter: 'blur(8px)'
          }}
        >
          Private Beta
        </div>
      </div>
    </div>
  );
}
