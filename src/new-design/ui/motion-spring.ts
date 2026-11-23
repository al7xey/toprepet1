// Spring integration from DesignBookmark Motion Studies.
// Source https://designbookmark.com/motion-src/shared/motion.js
// Component equations from tab-pill/tabs.js and toggle-switch/switch.js.
// Demo autoplay and gallery/theme messaging are omitted in the application.
export const S = (x: number, k = 400, c = 30) => ({ x, v: 0, t: x, k, c });
export type Spring = ReturnType<typeof S>;
export const step = (s: Spring, dt: number) => {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
};
export const tune = (s: Spring, k: number, c: number) => { s.k = k; s.c = c; };
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Four integration substeps, as in the source. Stops once the springs settle. */
export function runSprings(springs: Spring[], render: () => void) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let last = performance.now();
  const finish = () => {
    cancelAnimationFrame(frame);
    reduced.removeEventListener('change', onPreference);
    springs.forEach(s => { s.x = s.t; s.v = 0; });
    render();
  };
  const onPreference = () => { if (reduced.matches) finish(); };
  reduced.addEventListener('change', onPreference);
  const tick = (now: number) => {
    if (reduced.matches) { finish(); return; }
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    for (let i = 0; i < 4; i++) springs.forEach(s => step(s, dt / 4));
    render();
    if (springs.some(s => Math.abs(s.v) > .01 || Math.abs(s.t - s.x) > .001)) frame = requestAnimationFrame(tick);
    else finish();
  };
  frame = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(frame); reduced.removeEventListener('change', onPreference); };
}
