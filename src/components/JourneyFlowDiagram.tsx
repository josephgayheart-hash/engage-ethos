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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import { Mail, MessageSquare, Globe, Phone, Share2, FileText, Download, Image, FileCode, Users, Target, Calendar, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StrategyJourney, JourneyTouchpoint, MessageContext } from '@/types/persist';
import {
  applyDagreLayout,
  getNodesBounds,
  getNodeSize,
  parseWeekRange,
  resolveNonOverlappingX,
  shiftNodes,
} from '@/lib/journeyDiagramLayout';

interface JourneyFlowDiagramProps {
  journey: StrategyJourney;
  context?: MessageContext;
  startDate?: string;
  endDate?: string;
}

// Helper to calculate date for a specific week
const calculateWeekDate = (startDate: string | undefined, weekNumber: number): string | null => {
  if (!startDate) return null;
  try {
    const start = new Date(startDate);
    const weekDate = new Date(start);
    weekDate.setDate(start.getDate() + (weekNumber - 1) * 7);
    return weekDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
};

// Helper to format date for display
const formatDisplayDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

// Helper to format channel names with proper capitalization
const formatChannelName = (channel: string): string => {
  if (channel?.toLowerCase() === 'sms') return 'SMS';
  return channel?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
};

// Helper to format filter values
const formatFilterValue = (value: string | undefined): string => {
  if (!value) return 'Not specified';
  return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Custom node component for touchpoints
const TouchpointNode = ({ data }: { data: { touchpoint: JourneyTouchpoint; index: number; weekDate: string | null } }) => {
  const { touchpoint, index, weekDate } = data;
  
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
    <div className="bg-card border-2 border-border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[240px] cursor-move">
      <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2" />
      
      {/* Week & Date Header */}
      <div className="bg-muted/50 -mx-3 -mt-3 px-3 py-2 rounded-t-md mb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            Week {touchpoint.week}{weekDate && <span className="text-primary ml-1">• {weekDate}</span>}
          </span>
          <div className={`p-1 rounded ${getChannelColor(touchpoint.channel)} text-white`}>
            {getChannelIcon(touchpoint.channel)}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-1">{formatChannelName(touchpoint.channel)}</p>
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

// Journey info header node (for export)
interface JourneyInfoData {
  overview: string;
  audience?: string;
  cohort?: string;
  moment?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  totalWeeks: number;
  touchpointCount: number;
}

const JourneyInfoNode = ({ data }: { data: JourneyInfoData }) => {
  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg shadow-lg p-4 min-w-[600px] max-w-[900px]">
      {/* Title */}
      <div className="border-b border-border pb-3 mb-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Communication Journey Strategy
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{data.overview}</p>
      </div>
      
      {/* Metadata Grid */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        {/* Target Audience */}
        <div>
          <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Target Audience
          </p>
          <div className="space-y-0.5">
            {data.audience && <p><span className="text-muted-foreground">Audience:</span> {formatFilterValue(data.audience)}</p>}
            {data.cohort && <p><span className="text-muted-foreground">Cohort:</span> {formatFilterValue(data.cohort)}</p>}
            {data.moment && <p><span className="text-muted-foreground">Moment:</span> {formatFilterValue(data.moment)}</p>}
            {data.goal && <p><span className="text-muted-foreground">Goal:</span> {formatFilterValue(data.goal)}</p>}
          </div>
        </div>
        
        {/* Timeline */}
        <div>
          <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Timeline
          </p>
          <div className="space-y-0.5">
            {data.startDate && <p><span className="text-muted-foreground">Start:</span> {formatDisplayDate(data.startDate)}</p>}
            {data.endDate && <p><span className="text-muted-foreground">End:</span> {formatDisplayDate(data.endDate)}</p>}
            <p><span className="text-muted-foreground">Duration:</span> {data.totalWeeks} weeks</p>
          </div>
        </div>
        
        {/* Summary */}
        <div>
          <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Summary
          </p>
          <div className="space-y-0.5">
            <p><span className="text-muted-foreground">Touchpoints:</span> {data.touchpointCount}</p>
            <p><span className="text-muted-foreground">Phases:</span> 3 (Short/Mid/Long)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Node type mapping
const nodeTypes = {
  touchpoint: TouchpointNode,
  phase: PhaseNode,
  journeyInfo: JourneyInfoNode,
};

export const JourneyFlowDiagram = ({ journey, context, startDate, endDate }: JourneyFlowDiagramProps) => {
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
  const { initialNodes, initialEdges, diagramHeight } = useMemo(() => {
    const edges: Edge[] = [];

    // --- Touchpoints (laid out via dagre so nodes never overlap) ---
    const touchpointNodes: Node[] = journey.touchpoints.map((touchpoint, index) => {
      const weekDate = calculateWeekDate(startDate, touchpoint.week);

      return {
        id: `tp-${index}`,
        type: 'touchpoint',
        position: { x: 0, y: 0 },
        data: { touchpoint, index, weekDate },
        draggable: true,
      };
    });

    // Main journey edges (visible)
    for (let i = 1; i < touchpointNodes.length; i++) {
      edges.push({
        id: `e-${i - 1}-${i}`,
        source: `tp-${i - 1}`,
        target: `tp-${i}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      });
    }

    const laidOutTouchpoints = applyDagreLayout(touchpointNodes, edges, {
      direction: 'LR',
      nodeSep: 90,
      rankSep: 140,
    });

    // Shift the dagre graph into a predictable canvas region
    const tpBoundsRaw = getNodesBounds(laidOutTouchpoints);
    const touchpointsTopY = 420;
    const leftMarginX = 40;

    const shiftedTouchpoints = shiftNodes(
      laidOutTouchpoints,
      leftMarginX - tpBoundsRaw.minX,
      touchpointsTopY - tpBoundsRaw.minY
    );

    const nodeById = new Map(shiftedTouchpoints.map((n) => [n.id, n] as const));

    // --- Phases (positioned above the touchpoints, centered over their week ranges) ---
    const phaseSize = getNodeSize({
      id: 'phase-size',
      type: 'phase',
      position: { x: 0, y: 0 },
      data: {},
    } as Node);

    const phaseY = 260;

    const phaseDraft = journey.phases.map((phase, phaseIndex) => {
      const range = parseWeekRange(phase.weekRange);

      const relevant = journey.touchpoints
        .map((tp, index) => ({ tp, node: nodeById.get(`tp-${index}`) }))
        .filter(({ tp, node }) => {
          if (!node) return false;
          if (!range) return true;
          return tp.week >= range.startWeek && tp.week <= range.endWeek;
        })
        .map(({ node }) => node as Node);

      // Fallback if range parsing fails or no nodes match (space phases evenly over the touchpoint bounds)
      const tpBounds = getNodesBounds(shiftedTouchpoints);
      const fallbackCenterX =
        tpBounds.minX +
        ((phaseIndex + 0.5) / Math.max(1, journey.phases.length)) * (tpBounds.maxX - tpBounds.minX);

      const centerX = (() => {
        if (!relevant.length) return fallbackCenterX;
        let minX = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        for (const n of relevant) {
          const size = getNodeSize(n);
          minX = Math.min(minX, n.position.x);
          maxX = Math.max(maxX, n.position.x + size.width);
        }
        return (minX + maxX) / 2;
      })();

      return {
        id: `phase-${phaseIndex}`,
        type: 'phase',
        position: { x: centerX - phaseSize.width / 2, y: phaseY },
        data: {
          name: phase.name,
          weekRange: phase.weekRange,
          focus: phase.focus,
        },
        draggable: true,
      } satisfies Node;
    });

    const nonOverlappingPhaseX = resolveNonOverlappingX(
      phaseDraft.map((p) => ({ id: p.id, x: p.position.x, width: phaseSize.width })),
      28
    );

    const phaseNodes: Node[] = phaseDraft.map((p) => ({
      ...p,
      position: { ...p.position, x: nonOverlappingPhaseX[p.id] ?? p.position.x },
    }));

    // --- Journey info header (placed above phases) ---
    const infoSize = getNodeSize({
      id: 'info-size',
      type: 'journeyInfo',
      position: { x: 0, y: 0 },
      data: {},
    } as Node);

    const allTopNodes = [...phaseNodes, ...shiftedTouchpoints];
    const allTopBounds = getNodesBounds(allTopNodes);

    const journeyInfoNode: Node = {
      id: 'journey-info',
      type: 'journeyInfo',
      position: { x: allTopBounds.minX, y: 20 },
      data: {
        overview: journey.overview,
        audience: context?.audience,
        cohort: context?.cohort,
        moment: context?.moment,
        goal: context?.goal,
        startDate,
        endDate,
        totalWeeks: journey.totalWeeks,
        touchpointCount: journey.touchpoints.length,
      },
      draggable: true,
    };

    const nodes: Node[] = [journeyInfoNode, ...phaseNodes, ...shiftedTouchpoints];

    // Ensure the header never starts off-canvas even when it is wider than the touchpoints.
    const allBounds = getNodesBounds(nodes);
    const finalShiftX = Math.max(0, 24 - allBounds.minX);
    const shiftedAllNodes = finalShiftX ? shiftNodes(nodes, finalShiftX, 0) : nodes;

    const finalBounds = getNodesBounds(shiftedAllNodes);
    const diagramHeight = Math.max(560, finalBounds.maxY + 60);

    // Also keep the canvas wide enough for large header exports by shifting, rather than scaling.
    void infoSize;

    return { initialNodes: shiftedAllNodes, initialEdges: edges, diagramHeight };
  }, [journey, context, startDate, endDate]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div ref={flowRef} className="w-full border rounded-lg bg-muted/20 relative">
      {/* Journey Context Header */}
      <div className="bg-card border-b border-border p-4 rounded-t-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: Journey Overview */}
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Journey Overview
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{journey.overview}</p>
          </div>

          {/* Center: Filters/Context */}
          {context && (
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                Target Audience
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {formatFilterValue(context.audience)}
                </Badge>
                {context.cohort && (
                  <Badge variant="outline" className="text-[10px]">
                    {formatFilterValue(context.cohort)}
                  </Badge>
                )}
                {context.moment && (
                  <Badge variant="secondary" className="text-[10px]">
                    {formatFilterValue(context.moment)}
                  </Badge>
                )}
                {context.goal && (
                  <Badge variant="secondary" className="text-[10px]">
                    Goal: {formatFilterValue(context.goal)}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Right: Timeline */}
          <div className="min-w-[180px]">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Timeline
            </h3>
            <div className="space-y-1">
              {startDate && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Start:</span>{' '}
                  <span className="font-medium">{formatDisplayDate(startDate)}</span>
                </p>
              )}
              {endDate && (
                <p className="text-xs">
                  <span className="text-muted-foreground">End:</span>{' '}
                  <span className="font-medium">{formatDisplayDate(endDate)}</span>
                </p>
              )}
              <p className="text-xs">
                <span className="text-muted-foreground">Duration:</span>{' '}
                <span className="font-medium">{journey.totalWeeks} weeks</span>
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">Touchpoints:</span>{' '}
                <span className="font-medium">{journey.touchpoints.length}</span>
              </p>
            </div>
          </div>

          {/* Export Button */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-card shadow-md">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
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
        </div>
      </div>

      {/* React Flow Diagram */}
      <div style={{ height: `${diagramHeight}px` }}>
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
    </div>
  );
};

export default JourneyFlowDiagram;
