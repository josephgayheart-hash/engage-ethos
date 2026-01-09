import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Position,
  Handle,
  NodeProps,
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
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ParsedSection {
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  isRecommended: boolean;
}

interface WebStructureDiagramProps {
  url: string;
  pageTitle?: string;
  sections: ParsedSection[];
  selectedIds: Set<string>;
  onToggleSection: (id: string) => void;
}

const SECTION_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  'hero': { label: 'Hero', icon: Sparkles, color: 'text-primary', bgColor: 'bg-primary/10' },
  'about': { label: 'About', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  'mission': { label: 'Mission', icon: Target, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  'value-proposition': { label: 'Value Props', icon: CheckCircle2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  'statistics': { label: 'Statistics', icon: BarChart3, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  'testimonial': { label: 'Testimonial', icon: Quote, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  'feature-list': { label: 'Features', icon: List, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  'program-description': { label: 'Program', icon: GraduationCap, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  'call-to-action': { label: 'CTA', icon: ArrowRight, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  'contact': { label: 'Contact', icon: Phone, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  'navigation': { label: 'Navigation', icon: Navigation, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
  'footer': { label: 'Footer', icon: LayoutGrid, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
  'general': { label: 'General', icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

// Custom Domain Node
function DomainNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg min-w-[180px]">
      <Handle type="source" position={Position.Bottom} className="!bg-primary-foreground" />
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5" />
        <div>
          <p className="text-xs font-medium opacity-80">Domain</p>
          <p className="font-semibold text-sm truncate max-w-[150px]">{data.label}</p>
        </div>
      </div>
    </div>
  );
}

// Custom Page Node
function PageNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-3 rounded-xl bg-card border-2 border-primary/50 shadow-md min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Page</p>
          <p className="font-semibold text-sm truncate max-w-[170px]">{data.label}</p>
          {data.path && (
            <p className="text-xs text-muted-foreground truncate max-w-[170px]">{data.path}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Section Node
function SectionNode({ data }: NodeProps) {
  const config = SECTION_TYPE_CONFIG[data.sectionType] || SECTION_TYPE_CONFIG['general'];
  const Icon = config.icon;
  const isSelected = data.isSelected;
  
  return (
    <div 
      className={`px-3 py-2 rounded-lg border-2 shadow-sm cursor-pointer transition-all min-w-[160px] ${
        isSelected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border bg-card hover:border-primary/30'
      }`}
      onClick={() => data.onToggle?.()}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md ${config.bgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs truncate">{data.label}</p>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] h-4 px-1">
              {config.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{data.wordCount}w</span>
          </div>
        </div>
        {data.isRecommended && (
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Recommended" />
        )}
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
  onToggleSection 
}: WebStructureDiagramProps) {
  
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Parse domain from URL
    let domain = '';
    let path = '';
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
      path = urlObj.pathname;
    } catch {
      domain = url;
    }
    
    // Domain node at top
    nodes.push({
      id: 'domain',
      type: 'domain',
      position: { x: 250, y: 0 },
      data: { label: domain },
    });
    
    // Page node
    nodes.push({
      id: 'page',
      type: 'page',
      position: { x: 250, y: 100 },
      data: { 
        label: pageTitle || 'Page',
        path: path !== '/' ? path : undefined,
      },
    });
    
    edges.push({
      id: 'domain-page',
      source: 'domain',
      target: 'page',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      animated: true,
    });
    
    // Layout sections in a grid pattern
    const cols = 3;
    const nodeWidth = 180;
    const nodeHeight = 70;
    const gapX = 20;
    const gapY = 20;
    const startY = 220;
    
    // Calculate starting X to center the grid
    const totalWidth = Math.min(sections.length, cols) * (nodeWidth + gapX) - gapX;
    const startX = 250 - totalWidth / 2 + nodeWidth / 2;
    
    sections.forEach((section, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      nodes.push({
        id: section.id,
        type: 'section',
        position: { 
          x: startX + col * (nodeWidth + gapX),
          y: startY + row * (nodeHeight + gapY),
        },
        data: {
          label: section.title,
          sectionType: section.type,
          wordCount: section.wordCount,
          isRecommended: section.isRecommended,
          isSelected: selectedIds.has(section.id),
          onToggle: () => onToggleSection(section.id),
        },
      });
      
      edges.push({
        id: `page-${section.id}`,
        source: 'page',
        target: section.id,
        type: 'smoothstep',
        style: { 
          stroke: selectedIds.has(section.id) 
            ? 'hsl(var(--primary))' 
            : 'hsl(var(--muted-foreground))',
          strokeWidth: selectedIds.has(section.id) ? 2 : 1,
          opacity: selectedIds.has(section.id) ? 1 : 0.5,
        },
      });
    });
    
    return { nodes, edges };
  }, [url, pageTitle, sections, selectedIds, onToggleSection]);
  
  // Calculate dynamic height based on sections
  const rows = Math.ceil(sections.length / 3);
  const minHeight = 350;
  const dynamicHeight = Math.max(minHeight, 250 + rows * 90);
  
  return (
    <div className="w-full rounded-lg border bg-muted/20" style={{ height: dynamicHeight }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
      >
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
