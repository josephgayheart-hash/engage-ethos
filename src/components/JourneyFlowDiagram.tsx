import { useMemo, useCallback, useRef, useState } from 'react';
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
  SelectionMode,
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import type { StrategyJourney, JourneyTouchpoint, MessageContext } from '@/types/persist';

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
  const [exportBg, setExportBg] = useState<'themed' | 'white' | 'transparent'>('themed');
  const [exportQuality, setExportQuality] = useState<'standard' | 'high'>('high');

  // Export functions with options
  const exportToImage = useCallback((format: 'png' | 'svg') => {
    const flowElement = flowRef.current?.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const downloadImage = (dataUrl: string) => {
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.setAttribute('download', `journey-diagram-${timestamp}.${format}`);
      a.setAttribute('href', dataUrl);
      a.click();
    };

    const getBgColor = () => {
      if (exportBg === 'transparent') return undefined;
      if (exportBg === 'white') return '#ffffff';
      return 'hsl(var(--background))';
    };

    const exportFn = format === 'png' ? toPng : toSvg;
    
    exportFn(flowElement, {
      backgroundColor: getBgColor(),
      quality: 1,
      pixelRatio: exportQuality === 'high' ? 3 : 2,
    }).then(downloadImage).catch(console.error);
  }, [exportBg, exportQuality]);

  // Convert journey phases and touchpoints to React Flow nodes - ZIG-ZAG GRID LAYOUT
  const { initialNodes, initialEdges, dynamicHeight } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const touchpointCount = journey.touchpoints.length;
    
    // Grid layout settings for zig-zag pattern - tighter spacing
    const xSpacing = 280;
    const ySpacing = 170;
    const nodesPerRow = touchpointCount > 10 ? 4 : touchpointCount > 6 ? 3 : Math.min(touchpointCount, 4);
    const yBase = 200;
    
    // Calculate total width for centering
    const totalWidth = nodesPerRow * xSpacing;
    
    // Add journey info header node
    nodes.push({
      id: 'journey-info',
      type: 'journeyInfo',
      position: { x: 20, y: -200 },
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
    });
    
    // Add phase header nodes
    const phaseWidth = totalWidth / journey.phases.length;
    journey.phases.forEach((phase, phaseIndex) => {
      nodes.push({
        id: `phase-${phaseIndex}`,
        type: 'phase',
        position: { x: phaseIndex * phaseWidth + (phaseWidth / 2) - 75, y: 40 },
        data: { 
          name: phase.name,
          weekRange: phase.weekRange,
          focus: phase.focus,
        },
        draggable: true,
      });
    });
    
    // Add touchpoint nodes in a ZIG-ZAG / SERPENTINE pattern
    const totalRows = Math.ceil(touchpointCount / nodesPerRow);
    
    journey.touchpoints.forEach((touchpoint, index) => {
      const row = Math.floor(index / nodesPerRow);
      const colInRow = index % nodesPerRow;
      const isLastRow = row === totalRows - 1;
      const itemsInLastRow = touchpointCount % nodesPerRow || nodesPerRow;
      
      // Serpentine: odd rows go right-to-left
      const isOddRow = row % 2 === 1;
      
      // For partial last rows, keep items aligned to the flow direction
      let col: number;
      if (isLastRow && itemsInLastRow < nodesPerRow) {
        // Last row with fewer items - align to continue the flow
        if (isOddRow) {
          // Odd row flows right-to-left, so align items to the right side
          col = nodesPerRow - 1 - colInRow;
        } else {
          // Even row flows left-to-right, items naturally align left
          col = colInRow;
        }
      } else {
        // Full rows use standard serpentine
        col = isOddRow ? (nodesPerRow - 1 - colInRow) : colInRow;
      }
      
      const weekDate = calculateWeekDate(startDate, touchpoint.week);
      
      // No vertical stagger for clean alignment
      nodes.push({
        id: `tp-${index}`,
        type: 'touchpoint',
        position: { 
          x: col * xSpacing + 40, 
          y: yBase + (row * ySpacing)
        },
        data: { touchpoint, index, weekDate },
        draggable: true,
      });
      
      // Connect to previous node with smooth step edges
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
    
    // Calculate dynamic height based on rows - proportionate to actual content
    const rowCount = Math.ceil(touchpointCount / nodesPerRow);
    // Base: header info node + phase nodes (~180px), then ~180px per row of touchpoints
    const dynamicHeight = Math.max(350, 200 + rowCount * 180);
    
    return { initialNodes: nodes, initialEdges: edges, dynamicHeight };
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

          {/* Export Button with Options */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-card shadow-md">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Background</DropdownMenuLabel>
                <DropdownMenuCheckboxItem 
                  checked={exportBg === 'themed'} 
                  onCheckedChange={() => setExportBg('themed')}
                >
                  Theme Background
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={exportBg === 'white'} 
                  onCheckedChange={() => setExportBg('white')}
                >
                  White Background
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={exportBg === 'transparent'} 
                  onCheckedChange={() => setExportBg('transparent')}
                >
                  Transparent (PNG only)
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Quality</DropdownMenuLabel>
                <DropdownMenuCheckboxItem 
                  checked={exportQuality === 'standard'} 
                  onCheckedChange={() => setExportQuality('standard')}
                >
                  Standard (2x)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={exportQuality === 'high'} 
                  onCheckedChange={() => setExportQuality('high')}
                >
                  High Resolution (3x)
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
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
      <div style={{ height: `${dynamicHeight}px` }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-background"
          selectionOnDrag
          selectionMode={SelectionMode.Partial}
          panOnDrag={[1, 2]}
          selectNodesOnDrag={false}
        >
          <Background color="hsl(var(--border))" gap={20} />
          <Controls className="!bg-card !border-border !rounded-lg !shadow-md" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default JourneyFlowDiagram;
