import { useMemo, useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Position,
  Handle,
  NodeProps,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Globe, 
  FileText,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Quote,
  List,
  GraduationCap,
  Phone,
  Navigation,
  LayoutGrid,
  ArrowRight,
  CheckCircle2,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ParsedSection {
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  isRecommended: boolean;
}

interface DiscoveredPage {
  url: string;
  path: string;
  title: string;
}

interface WebStructureDiagramProps {
  url: string;
  pageTitle?: string;
  sections: ParsedSection[];
  selectedIds: Set<string>;
  onToggleSection: (id: string) => void;
  discoveredPages?: DiscoveredPage[];
}

const SECTION_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'hero': { label: 'Hero', icon: Sparkles, color: 'hsl(var(--primary))' },
  'about': { label: 'About', icon: Users, color: '#3b82f6' },
  'mission': { label: 'Mission', icon: Target, color: '#22c55e' },
  'value-proposition': { label: 'Value Props', icon: CheckCircle2, color: '#a855f7' },
  'statistics': { label: 'Statistics', icon: BarChart3, color: '#f97316' },
  'testimonial': { label: 'Testimonial', icon: Quote, color: '#ec4899' },
  'feature-list': { label: 'Features', icon: List, color: '#06b6d4' },
  'program-description': { label: 'Program', icon: GraduationCap, color: '#6366f1' },
  'call-to-action': { label: 'CTA', icon: ArrowRight, color: '#f59e0b' },
  'contact': { label: 'Contact', icon: Phone, color: '#6b7280' },
  'navigation': { label: 'Navigation', icon: Navigation, color: '#9ca3af' },
  'footer': { label: 'Footer', icon: LayoutGrid, color: '#9ca3af' },
  'general': { label: 'General', icon: FileText, color: 'hsl(var(--muted-foreground))' },
};

// Custom Domain Node - Clean top-level
function DomainNode({ data, selected }: NodeProps) {
  const isFocused = data.isFocused || selected;
  
  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-300 ease-out",
        isFocused && "scale-110"
      )}
      onClick={() => data.onFocus?.()}
    >
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-primary !border-2 !border-primary-foreground !-bottom-1.5"
      />
      <div className={cn(
        "px-5 py-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-xl border border-primary-foreground/10 transition-all duration-300",
        isFocused 
          ? "shadow-2xl shadow-primary/40 ring-4 ring-primary/30" 
          : "shadow-primary/25"
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Globe className={cn(
              "transition-all duration-300",
              isFocused ? "w-6 h-6" : "w-5 h-5"
            )} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium opacity-70">Domain</p>
            <p className={cn(
              "font-bold transition-all duration-300",
              isFocused ? "text-lg" : "text-base"
            )}>{data.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Page Node - Clean intermediate level
function PageNode({ data, selected }: NodeProps) {
  const isCurrentPage = data.isCurrentPage;
  const hasSubPages = data.hasSubPages;
  const isFocused = data.isFocused || selected;
  
  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-300 ease-out",
        isFocused && "scale-110"
      )}
      onClick={() => data.onFocus?.()}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "!w-3 !h-3 !border-2 !border-background !-top-1.5",
          isCurrentPage ? "!bg-primary" : "!bg-muted-foreground"
        )}
      />
      {(isCurrentPage || hasSubPages) && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background !-bottom-1.5"
        />
      )}
      <div className={cn(
        "px-5 py-4 rounded-xl bg-card border-2 transition-all duration-300",
        isCurrentPage ? "border-primary/40" : "border-border/50",
        isFocused 
          ? "shadow-2xl ring-4 ring-primary/30 border-primary" 
          : "shadow-lg hover:shadow-xl"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-all duration-300",
            isCurrentPage ? "bg-primary/10" : "bg-muted",
            isFocused && "bg-primary/20"
          )}>
            <FileText className={cn(
              "transition-all duration-300",
              isCurrentPage ? "text-primary" : "text-muted-foreground",
              isFocused ? "w-6 h-6" : "w-5 h-5"
            )} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
              {isCurrentPage ? 'Current Page' : 'Sub-page'}
            </p>
            <p className={cn(
              "font-semibold max-w-[180px] truncate transition-all duration-300",
              isFocused ? "text-base" : "text-sm"
            )}>{data.label}</p>
            {data.path && data.path !== '/' && (
              <p className="text-xs text-muted-foreground/70 font-mono max-w-[180px] truncate">{data.path}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Section Node - Clean leaf level with selection state
function SectionNode({ data, selected }: NodeProps) {
  const config = SECTION_TYPE_CONFIG[data.sectionType] || SECTION_TYPE_CONFIG['general'];
  const Icon = config.icon;
  const isSelected = data.isSelected;
  const isFocused = data.isFocused || selected;
  
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      // Toggle selection with modifier key
      data.onToggle?.();
    } else {
      // Focus the node
      data.onFocus?.();
    }
  };
  
  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-300 ease-out",
        isFocused && "scale-115 z-10"
      )} 
      onClick={handleClick}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "!w-2 !h-2 !border-2 !border-background !-top-1 transition-all duration-300",
          isSelected ? "!bg-primary" : "!bg-muted-foreground/50",
          isFocused && "!w-3 !h-3"
        )}
      />
      <div 
        className={cn(
          "relative px-4 py-3 rounded-xl border-2 transition-all duration-300",
          isSelected 
            ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" 
            : "bg-card border-border/50 hover:border-muted-foreground/50 hover:shadow-md",
          isFocused && "ring-4 ring-primary/20 shadow-2xl"
        )}
        style={{ 
          borderColor: isFocused ? config.color : (isSelected ? config.color : undefined),
          boxShadow: isFocused 
            ? `0 20px 40px -12px ${config.color}50` 
            : (isSelected ? `0 8px 24px -8px ${config.color}40` : undefined),
          transform: isFocused ? 'scale(1.1)' : undefined
        }}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div 
            className={cn(
              "absolute -top-2 -right-2 rounded-full flex items-center justify-center shadow-sm transition-all duration-300",
              isFocused ? "w-6 h-6" : "w-5 h-5"
            )}
            style={{ backgroundColor: config.color }}
          >
            <Check className={cn(
              "text-white transition-all duration-300",
              isFocused ? "w-4 h-4" : "w-3 h-3"
            )} />
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div 
            className={cn(
              "rounded-lg shrink-0 transition-all duration-300",
              isFocused ? "p-3" : "p-2"
            )}
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon 
              className={cn("transition-all duration-300", isFocused ? "w-5 h-5" : "w-4 h-4")} 
              style={{ color: config.color }} 
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-medium leading-tight max-w-[140px] truncate transition-all duration-300",
              isSelected && "text-foreground",
              isFocused ? "text-base max-w-[180px]" : "text-sm"
            )}>
              {data.label}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge 
                variant="secondary" 
                className={cn(
                  "font-normal transition-all duration-300",
                  isFocused ? "text-xs h-6 px-2" : "text-[10px] h-5 px-1.5"
                )}
                style={{ 
                  backgroundColor: `${config.color}10`,
                  color: config.color,
                  borderColor: `${config.color}30`
                }}
              >
                {config.label}
              </Badge>
              <span className={cn(
                "text-muted-foreground font-medium transition-all duration-300",
                isFocused ? "text-xs" : "text-[10px]"
              )}>
                {data.wordCount}w
              </span>
            </div>
          </div>
          {data.isRecommended && (
            <div 
              className={cn(
                "absolute -top-1 -left-1 rounded-full bg-green-500 ring-2 ring-background transition-all duration-300",
                isFocused ? "w-4 h-4" : "w-3 h-3"
              )}
              title="Recommended"
            />
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  domain: DomainNode,
  page: PageNode,
  section: SectionNode,
};

export function WebStructureDiagram({ 
  url, 
  pageTitle, 
  sections, 
  selectedIds, 
  onToggleSection,
  discoveredPages = []
}: WebStructureDiagramProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  
  const handleNodeFocus = useCallback((nodeId: string) => {
    setFocusedNodeId(prev => prev === nodeId ? null : nodeId);
  }, []);
  
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Parse domain from URL
    let domain = '';
    let currentPath = '';
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
      currentPath = urlObj.pathname;
    } catch {
      domain = url;
    }
    
    // Domain node at top center
    const centerX = 400;
    nodes.push({
      id: 'domain',
      type: 'domain',
      position: { x: centerX, y: 0 },
      data: { 
        label: domain,
        isFocused: focusedNodeId === 'domain',
        onFocus: () => handleNodeFocus('domain'),
      },
      draggable: true,
    });
    
    // Group discovered pages by depth level
    const hasSubPages = discoveredPages.length > 0;
    const pagesByDepth = new Map<number, DiscoveredPage[]>();
    
    discoveredPages.forEach(page => {
      const depth = page.path.split('/').filter(Boolean).length;
      if (!pagesByDepth.has(depth)) {
        pagesByDepth.set(depth, []);
      }
      pagesByDepth.get(depth)!.push(page);
    });
    
    // Find current page in discovered pages or create it
    const currentPageInDiscovered = discoveredPages.find(p => p.path === currentPath);
    
    // Add current page node
    const currentPageY = 120;
    nodes.push({
      id: 'page',
      type: 'page',
      position: { x: centerX, y: currentPageY },
      data: { 
        label: pageTitle || currentPageInDiscovered?.title || 'Page',
        path: currentPath,
        isCurrentPage: true,
        hasSubPages: sections.length > 0,
        isFocused: focusedNodeId === 'page',
        onFocus: () => handleNodeFocus('page'),
      },
      draggable: true,
    });
    
    // Edge from domain to current page
    edges.push({
      id: 'domain-page',
      source: 'domain',
      target: 'page',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: 'hsl(var(--primary))', 
        strokeWidth: focusedNodeId === 'page' || focusedNodeId === 'domain' ? 3 : 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--primary))',
        width: 20,
        height: 20,
      },
    });
    
    // Add discovered sub-pages as sibling nodes around the current page
    const subPagesWidth = 180;
    const subPagesSpacing = 20;
    const subPagesStartY = 120;
    
    // Filter out the current page from discovered pages
    const otherPages = discoveredPages.filter(p => p.path !== currentPath).slice(0, 15);
    
    if (otherPages.length > 0) {
      // Position sub-pages on the left and right of the current page
      const leftPages = otherPages.slice(0, Math.ceil(otherPages.length / 2));
      const rightPages = otherPages.slice(Math.ceil(otherPages.length / 2));
      
      // Left side pages
      leftPages.forEach((page, index) => {
        const nodeId = `subpage-${page.path}`;
        const x = centerX - 280 - (index % 2) * (subPagesWidth + subPagesSpacing);
        const y = subPagesStartY + Math.floor(index / 2) * 100;
        
        nodes.push({
          id: nodeId,
          type: 'page',
          position: { x, y },
          data: { 
            label: page.title,
            path: page.path,
            isCurrentPage: false,
            hasSubPages: false,
            isFocused: focusedNodeId === nodeId,
            onFocus: () => handleNodeFocus(nodeId),
          },
          draggable: true,
        });
        
        const isNodeFocused = focusedNodeId === nodeId;
        edges.push({
          id: `domain-subpage-${page.path}`,
          source: 'domain',
          target: nodeId,
          type: 'smoothstep',
          style: { 
            stroke: isNodeFocused ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            strokeWidth: isNodeFocused ? 2 : 1,
            opacity: isNodeFocused ? 1 : 0.4,
          },
        });
      });
      
      // Right side pages
      rightPages.forEach((page, index) => {
        const nodeId = `subpage-${page.path}`;
        const x = centerX + 280 + (index % 2) * (subPagesWidth + subPagesSpacing);
        const y = subPagesStartY + Math.floor(index / 2) * 100;
        
        nodes.push({
          id: nodeId,
          type: 'page',
          position: { x, y },
          data: { 
            label: page.title,
            path: page.path,
            isCurrentPage: false,
            hasSubPages: false,
            isFocused: focusedNodeId === nodeId,
            onFocus: () => handleNodeFocus(nodeId),
          },
          draggable: true,
        });
        
        const isNodeFocused = focusedNodeId === nodeId;
        edges.push({
          id: `domain-subpage-${page.path}`,
          source: 'domain',
          target: nodeId,
          type: 'smoothstep',
          style: { 
            stroke: isNodeFocused ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            strokeWidth: isNodeFocused ? 2 : 1,
            opacity: isNodeFocused ? 1 : 0.4,
          },
        });
      });
    }
    
    // Layout sections in a tree pattern below the current page
    const totalSections = sections.length;
    const nodeWidth = 200;
    const nodeHeight = 90;
    const horizontalSpacing = 20;
    const verticalSpacing = 30;
    const startY = hasSubPages ? Math.max(320, 120 + Math.ceil(otherPages.length / 4) * 100 + 80) : 280;
    
    // Calculate layout - distribute sections evenly
    const maxPerRow = Math.min(4, Math.ceil(totalSections / Math.ceil(totalSections / 4)));
    
    sections.forEach((section, index) => {
      const row = Math.floor(index / maxPerRow);
      const sectionsInThisRow = Math.min(maxPerRow, totalSections - row * maxPerRow);
      const colInRow = index % maxPerRow;
      
      // Center each row
      const rowWidth = sectionsInThisRow * nodeWidth + (sectionsInThisRow - 1) * horizontalSpacing;
      const rowStartX = centerX - rowWidth / 2 + nodeWidth / 2;
      
      const x = rowStartX + colInRow * (nodeWidth + horizontalSpacing);
      const y = startY + row * (nodeHeight + verticalSpacing);
      
      nodes.push({
        id: section.id,
        type: 'section',
        position: { x, y },
        data: {
          label: section.title,
          sectionType: section.type,
          wordCount: section.wordCount,
          isRecommended: section.isRecommended,
          isSelected: selectedIds.has(section.id),
          isFocused: focusedNodeId === section.id,
          onToggle: () => onToggleSection(section.id),
          onFocus: () => handleNodeFocus(section.id),
        },
        draggable: true,
      });
      
      const isSelected = selectedIds.has(section.id);
      const isFocused = focusedNodeId === section.id;
      const config = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG['general'];
      
      edges.push({
        id: `page-${section.id}`,
        source: 'page',
        target: section.id,
        type: 'smoothstep',
        pathOptions: { 
          offset: 15,
          borderRadius: 12,
        },
        style: { 
          stroke: isFocused || isSelected ? config.color : 'hsl(var(--muted-foreground))',
          strokeWidth: isFocused ? 3 : (isSelected ? 2 : 1),
          opacity: isFocused || isSelected ? 1 : 0.4,
        },
        markerEnd: (isFocused || isSelected) ? {
          type: MarkerType.ArrowClosed,
          color: config.color,
          width: isFocused ? 20 : 16,
          height: isFocused ? 20 : 16,
        } : undefined,
        animated: isFocused || isSelected,
      });
    });
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [url, pageTitle, sections, selectedIds, onToggleSection, discoveredPages, focusedNodeId, handleNodeFocus]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes when selection changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  // Calculate dynamic height based on sections and sub-pages
  const maxPerRow = Math.min(4, Math.ceil(sections.length / Math.ceil(sections.length / 4)));
  const sectionRows = Math.ceil(sections.length / maxPerRow);
  const subPageRows = Math.ceil(discoveredPages.length / 4);
  const minHeight = 400;
  const dynamicHeight = Math.max(minHeight, 380 + sectionRows * 120 + subPageRows * 50);
  
  // Handle clicking on empty space to clear focus
  const handlePaneClick = useCallback(() => {
    setFocusedNodeId(null);
  }, []);
  
  // Get unique section types from current sections for the legend
  const uniqueSectionTypes = useMemo(() => {
    const types = new Set<string>();
    sections.forEach(s => types.add(s.type));
    return Array.from(types);
  }, [sections]);
  
  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Section Types:</span>
        {uniqueSectionTypes.map(type => {
          const config = SECTION_TYPE_CONFIG[type] || SECTION_TYPE_CONFIG['general'];
          const Icon = config.icon;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: config.color }}
              />
              <Icon className="w-3 h-3" style={{ color: config.color }} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 ml-auto border-l pl-4">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border-2 border-primary bg-primary/10" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
      </div>
      
      {/* Diagram */}
      <div 
        className="w-full rounded-xl border bg-gradient-to-b from-background to-muted/20 overflow-hidden" 
        style={{ height: dynamicHeight }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        >
          <Background 
            color="hsl(var(--muted-foreground))" 
            gap={24} 
            size={1}
            style={{ opacity: 0.3 }}
          />
          <Controls 
            showInteractive={false}
            className="!bg-card !border-border !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
