import { useLayoutEffect, useRef } from 'react';

// Adapted from DesignBookmark Tab Pill: https://designbookmark.com/motion#db-tab-pill
// Two springs, one for each edge; the leading edge moves first.
export function useSpringPill(value: string) {
  const host = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const edges = useRef({ a: 0, b: 0, va: 0, vb: 0, ready: false });
  useLayoutEffect(() => {
    const root = host.current, indicator = pill.current;
    if (!root || !indicator) return;
    let frame = 0;
    const place = () => {
      cancelAnimationFrame(frame);
      const selected = root.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!selected) return;
      const left = selected.offsetLeft, right = left + selected.offsetWidth;
      const state = edges.current;
      const snap = !state.ready || matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (snap) { state.a = left; state.b = right; state.va = state.vb = 0; state.ready = true; }
      const forward = left > state.a;
      let last = performance.now(); const started = last;
      const render = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30) / 4; last = now;
        for (let i = 0; i < 4; i++) {
          const ka = forward ? 170 : 620, ca = forward ? 19 : 40;
          const kb = forward ? 620 : 170, cb = forward ? 40 : 19;
          state.va += (-ka * (state.a - left) - ca * state.va) * dt;
          state.vb += (-kb * (state.b - right) - cb * state.vb) * dt;
          state.a += state.va * dt; state.b += state.vb * dt;
        }
        indicator.style.transform = `translateX(${state.a}px)`;
        indicator.style.width = `${Math.max(0, state.b - state.a)}px`;
        if (!snap && now - started < 1400 && (Math.abs(state.a - left) + Math.abs(state.b - right) + Math.abs(state.va) + Math.abs(state.vb) > .1)) frame = requestAnimationFrame(render);
      };
      render(last);
    };
    place();
    const observer = new ResizeObserver(place); observer.observe(root);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [value]);
  return { host, pill };
}
