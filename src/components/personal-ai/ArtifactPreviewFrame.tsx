import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string;
  srcDoc?: string;
  /** Logical device width the HTML is designed for. The iframe renders at this width
   *  and is uniformly scaled down to fit the container — eliminating "janky" reflow
   *  when slide decks / wide layouts are previewed in a narrow panel. */
  deviceWidth?: number;
  /** Fixed pixel height (inline preview). When omitted the frame fills its parent. */
  height?: number;
  className?: string;
  title?: string;
  sandbox?: string;
}

export function ArtifactPreviewFrame({
  src,
  srcDoc,
  deviceWidth = 1280,
  height,
  className,
  title = "Preview",
  sandbox,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [containerH, setContainerH] = useState<number>(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0) setScale(Math.min(1, w / deviceWidth));
      if (h > 0) setContainerH(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [deviceWidth]);

  // Iframe natural height = container height / scale (so it fills vertically),
  // unless a fixed `height` was provided for inline previews.
  const iframeHeight = height
    ? Math.round(height / Math.max(scale, 0.0001))
    : Math.max(Math.round(containerH / Math.max(scale, 0.0001)), 600);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full overflow-hidden bg-white dark:bg-zinc-100",
        className
      )}
      style={height ? { height } : undefined}
    >
      <iframe
        title={title}
        src={src}
        srcDoc={srcDoc}
        sandbox={sandbox}
        style={{
          width: deviceWidth,
          height: iframeHeight,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background: "white",
        }}
      />
    </div>
  );
}
