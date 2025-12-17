import dagre from "dagre";
import type { Edge, Node } from "reactflow";

export type DagreDirection = "LR" | "TB";

const NODE_SIZES = {
  touchpoint: { width: 260, height: 170 },
  phase: { width: 180, height: 96 },
  journeyInfo: { width: 760, height: 220 },
} as const;

type NodeTypeKey = keyof typeof NODE_SIZES;

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const clampNumber = (n: number) => (Number.isFinite(n) ? n : 0);

export const getNodeSize = (node: Node): { width: number; height: number } => {
  const type = (node.type ?? "touchpoint") as NodeTypeKey;
  return NODE_SIZES[type] ?? NODE_SIZES.touchpoint;
};

export const getNodesBounds = (nodes: Node[]): Bounds => {
  if (!nodes.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const n of nodes) {
    const { width, height } = getNodeSize(n);
    const x = clampNumber(n.position?.x ?? 0);
    const y = clampNumber(n.position?.y ?? 0);

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return { minX, minY, maxX, maxY };
};

export const shiftNodes = (nodes: Node[], dx: number, dy: number): Node[] =>
  nodes.map((n) => ({
    ...n,
    position: {
      x: clampNumber(n.position?.x ?? 0) + dx,
      y: clampNumber(n.position?.y ?? 0) + dy,
    },
  }));

export const applyDagreLayout = (
  nodes: Node[],
  edges: Edge[],
  opts?: {
    direction?: DagreDirection;
    nodeSep?: number;
    rankSep?: number;
  }
): Node[] => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: opts?.direction ?? "LR",
    nodesep: opts?.nodeSep ?? 80,
    ranksep: opts?.rankSep ?? 120,
  });

  nodes.forEach((n) => {
    const { width, height } = getNodeSize(n);
    g.setNode(n.id, { width, height });
  });

  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  return nodes.map((n) => {
    const layoutNode = g.node(n.id) as { x: number; y: number } | undefined;
    const { width, height } = getNodeSize(n);

    const x = layoutNode ? layoutNode.x - width / 2 : 0;
    const y = layoutNode ? layoutNode.y - height / 2 : 0;

    return {
      ...n,
      position: { x, y },
    };
  });
};

export const parseWeekRange = (weekRange: string): { startWeek: number; endWeek: number } | null => {
  if (!weekRange) return null;

  // Common formats: "Weeks 1-4", "Week 3", "1-4"
  const rangeMatch = weekRange.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const startWeek = Number(rangeMatch[1]);
    const endWeek = Number(rangeMatch[2]);
    if (Number.isFinite(startWeek) && Number.isFinite(endWeek)) return { startWeek, endWeek };
  }

  const singleMatch = weekRange.match(/(\d+)/);
  if (singleMatch) {
    const wk = Number(singleMatch[1]);
    if (Number.isFinite(wk)) return { startWeek: wk, endWeek: wk };
  }

  return null;
};

export const resolveNonOverlappingX = (
  items: Array<{ id: string; x: number; width: number }>,
  gap = 24
): Record<string, number> => {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const out: Record<string, number> = {};

  let cursor = -Infinity;
  for (const it of sorted) {
    const nextX = Math.max(it.x, cursor);
    out[it.id] = nextX;
    cursor = nextX + it.width + gap;
  }

  return out;
};
