import { Link } from "react-router-dom";
import { useMemo, useCallback, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  Map, 
  Calendar,
  Clock,
  TrendingUp,
  FileDown,
  Layers,
  Mail,
  MessageSquare,
  Phone,
  Target,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Zap,
  Move,
  ZoomIn
} from "lucide-react";
import uplaybookLogo from "@/assets/uplaybook-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";

const journeyPhases = [
  { week: "Week 1-2", label: "Awareness", intensity: "Low", channels: ["Email", "Social"] },
  { week: "Week 3-4", label: "Engagement", intensity: "Medium", channels: ["Email", "SMS", "Portal"] },
  { week: "Week 5-8", label: "Nurturing", intensity: "High", channels: ["Email", "SMS", "Phone"] },
  { week: "Week 9-12", label: "Conversion", intensity: "Peak", channels: ["All Channels"] },
];

const cadenceOptions = [
  { label: "Daily", description: "High-intensity campaigns" },
  { label: "Twice Weekly", description: "Active engagement" },
  { label: "Weekly", description: "Steady touchpoints" },
  { label: "Bi-Weekly", description: "Light touch" },
  { label: "Monthly", description: "Check-ins only" },
];

const escalationPatterns = [
  { label: "Linear", description: "Steady pace throughout" },
  { label: "Front-Loaded", description: "Heavy start, taper off" },
  { label: "Back-Loaded", description: "Build momentum toward deadline" },
  { label: "Bell Curve", description: "Ramp up, peak, wind down" },
];

const features = [
  {
    icon: Calendar,
    title: "Date-Aware Planning",
    description: "Set start and end dates, and the AI maps touchpoints to real calendar dates with deadline awareness.",
  },
  {
    icon: TrendingUp,
    title: "Escalation Patterns",
    description: "Choose how intensity builds—front-loaded, back-loaded, linear, or bell curve progression.",
  },
  {
    icon: Layers,
    title: "Multi-Channel Orchestration",
    description: "Coordinate email, SMS, phone, social, and more across a unified timeline.",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    description: "Download polished journey maps for stakeholder presentations and team alignment.",
  },
];

// Demo touchpoint node for the interactive preview
const DemoTouchpointNode = ({ data }: { data: { channel: string; week: number; title: string; description: string } }) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'bg-blue-500';
      case 'sms': return 'bg-green-500';
      case 'phone': return 'bg-purple-500';
      default: return 'bg-teal-500';
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg shadow-lg p-3 min-w-[180px] max-w-[200px] cursor-grab active:cursor-grabbing">
      <Handle type="target" position={Position.Left} className="!bg-teal-500 !w-2 !h-2" />
      <div className="bg-muted/50 -mx-3 -mt-3 px-3 py-2 rounded-t-md mb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Week {data.week}</span>
          <div className={`p-1 rounded ${getChannelColor(data.channel)} text-white`}>
            {getChannelIcon(data.channel)}
          </div>
        </div>
      </div>
      <p className="text-xs font-medium mb-1">{data.title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{data.description}</p>
      <Handle type="source" position={Position.Right} className="!bg-teal-500 !w-2 !h-2" />
    </div>
  );
};

const demoNodeTypes = {
  touchpoint: DemoTouchpointNode,
};

// Demo journey data for the interactive preview
const demoTouchpoints = [
  { id: 'tp-1', channel: 'email', week: 1, title: 'Welcome Email', description: 'Personalized intro to program benefits' },
  { id: 'tp-2', channel: 'sms', week: 2, title: 'Quick Check-in', description: 'Deadline reminder with CTA' },
  { id: 'tp-3', channel: 'email', week: 3, title: 'Feature Spotlight', description: 'Highlight key opportunities' },
  { id: 'tp-4', channel: 'phone', week: 4, title: 'Personal Outreach', description: 'One-on-one connection' },
  { id: 'tp-5', channel: 'email', week: 5, title: 'Success Stories', description: 'Social proof and testimonials' },
  { id: 'tp-6', channel: 'sms', week: 6, title: 'Final Deadline', description: 'Urgent call to action' },
];

export default function JourneyDesignerFeaturePage() {
  // Interactive demo React Flow nodes and edges
  const { demoNodes, demoEdges } = useMemo(() => {
    const nodes: Node[] = demoTouchpoints.map((tp, i) => {
      const row = Math.floor(i / 3);
      const col = row % 2 === 0 ? i % 3 : 2 - (i % 3);
      return {
        id: tp.id,
        type: 'touchpoint',
        position: { x: col * 240 + 50, y: row * 150 + 50 },
        data: { channel: tp.channel, week: tp.week, title: tp.title, description: tp.description },
        draggable: true,
      };
    });

    const edges: Edge[] = demoTouchpoints.slice(1).map((tp, i) => ({
      id: `e-${i}`,
      source: demoTouchpoints[i].id,
      target: tp.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#14b8a6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' },
    }));

    return { demoNodes: nodes, demoEdges: edges };
  }, []);

  const [nodes, , onNodesChange] = useNodesState(demoNodes);
  const [edges, , onEdgesChange] = useEdgesState(demoEdges);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={uplaybookLogo} alt="CampusVoice" className="h-8" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/request-access">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Join Beta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-background to-emerald-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(173_58%_85%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(160_60%_85%_/_0.25),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(173_58%_50%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(160_60%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute top-32 right-[35%] w-16 h-16 bg-[hsl(82_85%_55%_/_0.15)] rounded-full blur-xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/10 text-teal-600 border-teal-500/20 animate-fade-in">
              <Map className="w-3 h-3 mr-1" />
              AI Journey Mapping
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Design Complete
              <span className="block text-teal-600">Communication Journeys</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Map multi-week campaigns with cadence controls, escalation patterns, and channel orchestration—then export polished PDFs for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--muted) / 0.3)"/>
          </svg>
        </div>
      </section>

      {/* Journey Timeline Demo */}
      <section className="py-16 bg-[hsl(173_40%_92%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-[40%] w-20 h-20 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-semibold text-lg">First-Year Enrollment Journey</h3>
                  <p className="text-sm text-muted-foreground">12 weeks • 24 touchpoints • 4 channels</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-teal-300">
                    <Calendar className="w-3 h-3 mr-1" />
                    Aug 1 - Oct 24
                  </Badge>
                  <Badge className="bg-teal-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
              </div>

              {/* Timeline visualization */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-emerald-500 to-green-500" />
                
                <div className="space-y-6">
                  {journeyPhases.map((phase, i) => (
                    <div key={i} className="relative pl-12">
                      <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-background ${
                        i === 0 ? 'bg-teal-500' : 
                        i === 1 ? 'bg-teal-400' : 
                        i === 2 ? 'bg-emerald-500' : 'bg-green-500'
                      }`} />
                      
                      <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-teal-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">{phase.week}</span>
                            <span className="font-semibold">{phase.label}</span>
                          </div>
                          <Badge variant={
                            phase.intensity === 'Low' ? 'secondary' :
                            phase.intensity === 'Medium' ? 'outline' :
                            phase.intensity === 'High' ? 'default' : 'default'
                          } className={phase.intensity === 'Peak' ? 'bg-teal-600' : ''}>
                            {phase.intensity} Intensity
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {phase.channels.map((ch, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Controls Demo */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Precise Cadence Controls
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fine-tune how often you reach out and how intensity builds over time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cadence Options */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold">Cadence Frequency</h3>
                </div>
                <div className="space-y-3">
                  {cadenceOptions.map((option, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${i === 2 ? 'border-teal-300 bg-teal-50 dark:bg-teal-950/20' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-2">
                        {i === 2 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalation Patterns */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold">Escalation Pattern</h3>
                </div>
                <div className="space-y-3">
                  {escalationPatterns.map((pattern, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${i === 2 ? 'border-teal-300 bg-teal-50 dark:bg-teal-950/20' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-2">
                        {i === 2 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                        <span className="font-medium text-sm">{pattern.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-[hsl(48_100%_92%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(173_58%_50%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-16 left-[8%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 80L60 65C120 50 240 20 360 15C480 10 600 30 720 40C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Interactive Flow Diagram Demo */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-1/4 right-[8%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-[12%] w-28 h-28 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Interactive Flow Diagrams
              </h2>
              <p className="text-muted-foreground mb-4">
                See your entire journey as an interactive flow diagram with channel-coded touchpoints.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-teal-600" />
                  <span>Drag nodes to rearrange</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-teal-600" />
                  <span>Scroll to zoom</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl border-2 border-teal-300 shadow-xl overflow-hidden">
              {/* Legend */}
              <div className="bg-muted/50 border-b border-border px-4 py-3 flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">Channel Legend:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">Email</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageSquare className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">SMS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                    <Phone className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">Phone</span>
                </div>
              </div>
              
              {/* React Flow Canvas */}
              <div className="h-[400px]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={demoNodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.3 }}
                  minZoom={0.5}
                  maxZoom={1.5}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="hsl(var(--border))" gap={20} />
                  <Controls className="!bg-card !border-border !shadow-lg" />
                  <MiniMap 
                    className="!bg-card !border-border"
                    nodeColor={() => '#14b8a6'}
                    maskColor="rgba(0,0,0,0.1)"
                  />
                </ReactFlow>
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Try dragging the nodes around! In the full app, export as PNG, SVG, or PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Explore More Features */}
      <FeatureNavigation currentFeatureId="journey-designer" />

      {/* CTA Section */}
      <section className="py-20 bg-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Map Your Journeys?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta to start designing complete communication campaigns.
          </p>
          <Link to="/request-access">
            <Button size="lg" variant="secondary" className="gap-2">
              Request Beta Access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <img src={uplaybookLogo} alt="CampusVoice" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CampusVoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
