import { useEffect, useRef, useState, useCallback } from "react";

interface CanvasRulerProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

function generateTicks(size: number) {
  const ticks: { pos: number; label: string; major: boolean }[] = [];
  // Choose step: 50px, 100px, or 200px depending on size
  const step = size <= 400 ? 50 : size <= 800 ? 100 : 200;
  for (let px = 0; px <= size; px += step) {
    ticks.push({ pos: px, label: `${px}`, major: px % (step * 2) === 0 || px === 0 });
  }
  return { ticks, total: size };
}

export function CanvasRuler({ targetRef }: CanvasRulerProps) {
  const [dims, setDims] = useState({ w: 0, h: 0, renderedW: 0, renderedH: 0 });
  const rafRef = useRef(0);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Try to get natural image dimensions for pixel-accurate rulers
    const img = el.querySelector("img");
    const naturalW = img?.naturalWidth || Math.round(rect.width * 2);
    const naturalH = img?.naturalHeight || Math.round(rect.height * 2);
    setDims({
      w: naturalW,
      h: naturalH,
      renderedW: rect.width,
      renderedH: rect.height,
    });
  }, [targetRef]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    });
    if (targetRef.current) observer.observe(targetRef.current);
    // Also watch for image load
    const img = targetRef.current?.querySelector("img");
    if (img) {
      img.addEventListener("load", measure);
      return () => {
        observer.disconnect();
        img.removeEventListener("load", measure);
      };
    }
    return () => observer.disconnect();
  }, [targetRef, measure]);

  if (!dims.renderedW || !dims.renderedH) return null;

  const hTicks = generateTicks(dims.w);
  const vTicks = generateTicks(dims.h);
  const scaleX = dims.renderedW / dims.w;
  const scaleY = dims.renderedH / dims.h;

  return (
    <>
      {/* Top ruler */}
      <div
        className="absolute left-0 right-0 h-5 pointer-events-none select-none"
        style={{ top: -22, marginLeft: 0, width: dims.renderedW }}
      >
        {/* Track line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-muted-foreground/25" />
        {hTicks.ticks.map((tick, i) => {
          const x = tick.pos * scaleX;
          return (
            <div key={i} className="absolute bottom-0" style={{ left: x }}>
              <div
                className={`w-px ${tick.major ? "h-2.5 bg-muted-foreground/40" : "h-1.5 bg-muted-foreground/20"}`}
              />
              {tick.major && (
                <span className="absolute -top-0.5 left-0.5 text-[8px] text-muted-foreground/50 font-mono leading-none whitespace-nowrap">
                  {tick.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Left ruler */}
      <div
        className="absolute top-0 bottom-0 w-5 pointer-events-none select-none"
        style={{ left: -22, marginTop: 0, height: dims.renderedH }}
      >
        {/* Track line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-muted-foreground/25" />
        {vTicks.ticks.map((tick, i) => {
          const y = tick.pos * scaleY;
          return (
            <div key={i} className="absolute right-0" style={{ top: y }}>
              <div
                className={`h-px ${tick.major ? "w-2.5 bg-muted-foreground/40" : "w-1.5 bg-muted-foreground/20"}`}
              />
              {tick.major && (
                <span
                  className="absolute right-3 text-[8px] text-muted-foreground/50 font-mono leading-none whitespace-nowrap"
                  style={{ top: 1 }}
                >
                  {tick.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Dimension badge */}
      <div className="absolute -top-6 -right-1 text-[9px] font-mono text-muted-foreground/50 whitespace-nowrap">
        {dims.w} × {dims.h}px
      </div>
    </>
  );
}
