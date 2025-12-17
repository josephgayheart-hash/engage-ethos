import { useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import { Mail, MessageSquare, Globe, Phone, Share2, FileText, Download, Image, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StrategyJourney, JourneyTouchpoint } from '@/types/persist';

interface JourneyFlowDiagramProps {
  journey: StrategyJourney;
}

// Custom node component for touchpoints
const TouchpointNode = ({ data }: { data: { touchpoint: JourneyTouchpoint; index: number } }) => {
  const { touchpoint, index } = data;
  
  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'phone': case 'phone-call': return <Phone className="w-4 h-4" />;
      case 'social-media': return <Share2 className="w-4 h-4" />;
      case 'portal': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'email': return 'bg-blue-500';
      case 'sms': return 'bg-green-500';
      case 'phone': case 'phone-call': return 'bg-purple-500';
      case 'social-media': return 'bg-pink-500';
      case 'portal': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg shadow-lg p-3 min-w-[180px] max-w-[220px] cursor-move">
      <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${getChannelColor(touchpoint.channel)} text-white`}>
          {getChannelIcon(touchpoint.channel)}
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground">Step {index + 1}</p>
          <p className="text-sm font-semibold capitalize">{touchpoint.channel}</p>
        </div>
      </div>
      
      <p className="text-xs font-medium mb-1 line-clamp-1">{touchpoint.title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {touchpoint.description}
      </p>
      
      {touchpoint.behavioralNudge && (
        <Badge variant="outline" className="text-[9px] px-1 py-0">
          {touchpoint.behavioralNudge.split(' ').slice(0, 3).join(' ')}...
        </Badge>
      )}
      
      <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
    </div>
  );
};

// Phase header node
const PhaseNode = ({ data }: { data: { name: string; weekRange: string; focus: string } }) => {
  return (
    <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-3 text-center min-w-[150px]">
      <p className="font-bold text-sm">{data.name}</p>
      <p className="text-xs text-muted-foreground">{data.weekRange}</p>
      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{data.focus}</p>
    </div>
  );
};

// Node type mapping
const nodeTypes = {
  touchpoint: TouchpointNode,
  phase: PhaseNode,
};

export const JourneyFlowDiagram = ({ journey }: JourneyFlowDiagramProps) => {
  const flowRef = useRef<HTMLDivElement>(null);

  // Export functions
  const exportToImage = useCallback((format: 'png' | 'svg') => {
    const flowElement = flowRef.current?.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const downloadImage = (dataUrl: string) => {
      const a = document.createElement('a');
      a.setAttribute('download', `journey-diagram.${format}`);
      a.setAttribute('href', dataUrl);
      a.click();
    };

    const exportFn = format === 'png' ? toPng : toSvg;
    
    exportFn(flowElement, {
      backgroundColor: 'hsl(var(--background))',
      quality: 1,
      pixelRatio: 2,
    }).then(downloadImage).catch(console.error);
  }, []);

  // Convert journey phases and touchpoints to React Flow nodes
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const xSpacing = 260;
    const yBase = 100;
    
    // Add phase header nodes across the top
    journey.phases.forEach((phase, phaseIndex) => {
      const phaseNode: Node = {
        id: `phase-${phaseIndex}`,
        type: 'phase',
        position: { x: phaseIndex * (xSpacing * 1.5), y: -60 },
        data: { 
          name: phase.name,
          weekRange: phase.weekRange,
          focus: phase.focus,
        },
        draggable: true,
      };
      nodes.push(phaseNode);
    });
    
    // Add touchpoint nodes
    journey.touchpoints.forEach((touchpoint, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const yOffset = row % 2 === 0 ? 0 : 80;
      
      nodes.push({
        id: `tp-${index}`,
        type: 'touchpoint',
        position: { x: col * xSpacing, y: yBase + (row * 180) + yOffset },
        data: { touchpoint, index },
        draggable: true,
      });
      
      // Connect to previous node
      if (index > 0) {
        edges.push({
          id: `e-${index - 1}-${index}`,
          source: `tp-${index - 1}`,
          target: `tp-${index}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))',
          },
        });
      }
    });
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [journey]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div ref={flowRef} className="w-full h-[450px] border rounded-lg bg-muted/20 relative">
      {/* Export Button */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-card shadow-md">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportToImage('png')}>
              <Image className="w-4 h-4 mr-2" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToImage('svg')}>
              <FileCode className="w-4 h-4 mr-2" />
              Export as SVG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        className="bg-background"
      >
        <Background color="hsl(var(--border))" gap={20} />
        <Controls className="!bg-card !border-border !rounded-lg !shadow-md" />
      </ReactFlow>
    </div>
  );
};

export default JourneyFlowDiagram;
