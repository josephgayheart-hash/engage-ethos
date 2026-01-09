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
function DomainNode({ data }: NodeProps) {
  return (
    <div className="group">
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-primary !border-2 !border-primary-foreground !-bottom-1.5"
      />
      <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 border border-primary-foreground/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium opacity-70">Domain</p>
            <p className="font-bold text-base">{data.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Page Node - Clean intermediate level
function PageNode({ data }: NodeProps) {
  const isCurrentPage = data.isCurrentPage;
  const hasSubPages = data.hasSubPages;
  
  return (
    <div className="group">
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
        "px-5 py-4 rounded-xl bg-card border-2 shadow-lg hover:shadow-xl transition-shadow",
        isCurrentPage ? "border-primary/40" : "border-border/50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isCurrentPage ? "bg-primary/10" : "bg-muted"
          )}>
            <FileText className={cn(
              "w-5 h-5",
              isCurrentPage ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
              {isCurrentPage ? 'Current Page' : 'Sub-page'}
            </p>
            <p className="font-semibold text-sm max-w-[180px] truncate">{data.label}</p>
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
function SectionNode({ data }: NodeProps) {
  const config = SECTION_TYPE_CONFIG[data.sectionType] || SECTION_TYPE_CONFIG['general'];
  const Icon = config.icon;
  const isSelected = data.isSelected;
  
  return (
    <div className="group cursor-pointer" onClick={() => data.onToggle?.()}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn(
          "!w-2 !h-2 !border-2 !border-background !-top-1",
          isSelected ? "!bg-primary" : "!bg-muted-foreground/50"
        )}
      />
      <div 
        className={cn(
          "relative px-4 py-3 rounded-xl border-2 transition-all duration-200",
          isSelected 
            ? "bg-primary/5 border-primary shadow-lg shadow-primary/10 scale-105" 
            : "bg-card border-border/50 hover:border-muted-foreground/50 hover:shadow-md"
        )}
        style={{ 
          borderColor: isSelected ? config.color : undefined,
          boxShadow: isSelected ? `0 8px 24px -8px ${config.color}40` : undefined
        }}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div 
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: config.color }}
          >
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-lg shrink-0"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: config.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-medium text-sm leading-tight max-w-[140px] truncate",
              isSelected && "text-foreground"
            )}>
              {data.label}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge 
                variant="secondary" 
                className="text-[10px] h-5 px-1.5 font-normal"
                style={{ 
                  backgroundColor: `${config.color}10`,
                  color: config.color,
                  borderColor: `${config.color}30`
                }}
              >
                {config.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-medium">
                {data.wordCount}w
              </span>
            </div>
          </div>
          {data.isRecommended && (
            <div 
              className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-green-500 ring-2 ring-background" 
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
      data: { label: domain },
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
        strokeWidth: 2,
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
        const x = centerX - 280 - (index % 2) * (subPagesWidth + subPagesSpacing);
        const y = subPagesStartY + Math.floor(index / 2) * 100;
        
        nodes.push({
          id: `subpage-${page.path}`,
          type: 'page',
          position: { x, y },
          data: { 
            label: page.title,
            path: page.path,
            isCurrentPage: false,
            hasSubPages: false,
          },
          draggable: true,
        });
        
        edges.push({
          id: `domain-subpage-${page.path}`,
          source: 'domain',
          target: `subpage-${page.path}`,
          type: 'smoothstep',
          style: { 
            stroke: 'hsl(var(--muted-foreground))',
            strokeWidth: 1,
            opacity: 0.4,
          },
        });
      });
      
      // Right side pages
      rightPages.forEach((page, index) => {
        const x = centerX + 280 + (index % 2) * (subPagesWidth + subPagesSpacing);
        const y = subPagesStartY + Math.floor(index / 2) * 100;
        
        nodes.push({
          id: `subpage-${page.path}`,
          type: 'page',
          position: { x, y },
          data: { 
            label: page.title,
            path: page.path,
            isCurrentPage: false,
            hasSubPages: false,
          },
          draggable: true,
        });
        
        edges.push({
          id: `domain-subpage-${page.path}`,
          source: 'domain',
          target: `subpage-${page.path}`,
          type: 'smoothstep',
          style: { 
            stroke: 'hsl(var(--muted-foreground))',
            strokeWidth: 1,
            opacity: 0.4,
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
          onToggle: () => onToggleSection(section.id),
        },
        draggable: true,
      });
      
      const isSelected = selectedIds.has(section.id);
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
          stroke: isSelected ? config.color : 'hsl(var(--muted-foreground))',
          strokeWidth: isSelected ? 2 : 1,
          opacity: isSelected ? 1 : 0.4,
        },
        markerEnd: isSelected ? {
          type: MarkerType.ArrowClosed,
          color: config.color,
          width: 16,
          height: 16,
        } : undefined,
        animated: isSelected,
      });
    });
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [url, pageTitle, sections, selectedIds, onToggleSection, discoveredPages]);
  
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
  
  return (
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
  );
}
