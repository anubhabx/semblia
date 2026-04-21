import * as React from "react";

/* ─── Width observer — measures an element's own container width ────────── */

export function useContainerWidth<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  number,
] {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      });
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return [ref, width];
}
