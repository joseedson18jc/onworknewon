import * as React from 'react';
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide,
  type SimulationNodeDatum, type SimulationLinkDatum,
} from 'd3-force';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  title?: string;
  stance: 'champion' | 'neutral' | 'blocker' | 'unknown';
  influence: number;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const STANCE_COLOR: Record<GraphNode['stance'], string> = {
  champion: '#22C55E',
  neutral: '#F59E0B',
  blocker: '#EF4444',
  unknown: '#6C7A90',
};

export interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  width?: number;
  height?: number;
  ariaLabel?: string;
  /** Optional — raised when a node is clicked (for a "list-mode" toggle or drill-in). */
  onSelect?: (node: GraphNode) => void;
  /** Read-only text fallback for screen readers. */
  textModeId?: string;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes, links, width = 640, height = 420, ariaLabel = 'Decision maker graph', onSelect, textModeId,
}) => {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const nodeCopy = React.useRef<GraphNode[]>([]);
  const linkCopy = React.useRef<GraphLink[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Clone to avoid d3 mutating the caller's arrays across renders
    nodeCopy.current = nodes.map((n) => ({ ...n }));
    linkCopy.current = links.map((l) => ({ ...l }));

    const sim = forceSimulation<GraphNode>(nodeCopy.current)
      .force('link', forceLink<GraphNode, GraphLink>(linkCopy.current).id((d) => d.id).distance(90).strength(0.35))
      .force('charge', forceManyBody().strength(-220))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GraphNode>().radius((d) => 12 + Math.sqrt(d.influence) * 0.6));

    sim.on('tick', force);

    // Respect prefers-reduced-motion — skip directly to end of simulation.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < 300; i++) sim.tick();
      sim.stop();
      force();
    }

    return () => { sim.stop(); };
  }, [nodes, links, width, height]);

  const radius = (n: GraphNode) => 8 + Math.sqrt(n.influence) * 0.6;

  return (
    <>
      <svg
        role="img"
        aria-label={ariaLabel}
        aria-describedby={textModeId}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="max-w-full bg-bg-elev-2/40 rounded-md border border-border-subtle"
      >
        <g aria-hidden>
          {linkCopy.current.map((l, i) => {
            const s = l.source as GraphNode;
            const t = l.target as GraphNode;
            if (!s || !t || typeof s.x !== 'number' || typeof t.x !== 'number') return null;
            return <line key={i} x1={s.x} y1={s.y ?? 0} x2={t.x} y2={t.y ?? 0} stroke="rgb(var(--border))" strokeOpacity="0.5" strokeWidth={1} />;
          })}
        </g>
        <g>
          {nodeCopy.current.map((n) => {
            if (typeof n.x !== 'number') return null;
            const isSel = selected === n.id;
            return (
              <g
                key={n.id}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}${n.title ? ' — ' + n.title : ''}. Stance: ${n.stance}. Influence: ${n.influence}`}
                transform={`translate(${n.x}, ${n.y ?? 0})`}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={() => { setSelected(n.id); onSelect?.(n); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(n.id); onSelect?.(n); } }}
              >
                <circle r={radius(n) + (isSel ? 3 : 0)} fill={STANCE_COLOR[n.stance]} fillOpacity={isSel ? 0.9 : 0.7} stroke={isSel ? 'rgb(var(--accent))' : STANCE_COLOR[n.stance]} strokeWidth={isSel ? 2 : 1} />
                <text x={radius(n) + 6} dy="0.32em" className="fill-text text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {textModeId && (
        <details id={textModeId} className="mt-3 text-xs text-text-muted">
          <summary className="cursor-pointer hover:text-text">View as list (screen-reader friendly)</summary>
          <ul className="mt-2 space-y-1 pl-4 list-disc">
            {nodes.map((n) => (
              <li key={n.id}>
                <strong>{n.label}</strong>{n.title ? ` — ${n.title}` : ''} · stance: {n.stance} · influence: {n.influence}
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
};
