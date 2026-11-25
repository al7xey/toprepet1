import { useEffect } from 'react';

// DesignBookmark Spring Dropdown, https://designbookmark.com/motion#db-spring-dropdown
// Adapted spring integration; no gallery autoplay, theme storage or demo timers.
function frames() {
  let x = 0, v = 0;
  const result: Keyframe[] = [];
  for (let i = 0; i <= 48; i++) {
    result.push({ opacity: Math.min(1, Math.max(0, x)), transform: `translateY(${(x - 1) * 14}px) scale(${.96 + .04 * x})`, offset: i / 48 });
    for (let n = 0; n < 4; n++) { const dt = .6 / 48 / 4; v += (-260 * (x - 1) - 24 * v) * dt; x += v * dt; }
  }
  result[result.length - 1] = { opacity: 1, transform: 'none', offset: 1 };
  return result;
}
export function StudioMotion() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const running = new Set<Animation>();
    const animate = (node: Element) => {
      if (preference.matches) return;
      for (const el of [node, ...node.querySelectorAll('.trh-drop-menu,.trk-modal')]) {
        if (!el.matches('.trh-drop-menu,.trk-modal')) continue;
        const animation = el.animate(frames(), { duration: 600, easing: 'linear' });
        running.add(animation); void animation.finished.catch(() => {}).finally(() => running.delete(animation));
      }
    };
    const observer = new MutationObserver((records) => { for (const record of records) for (const node of record.addedNodes) if (node instanceof Element) animate(node); });
    observer.observe(document.body, { childList: true, subtree: true });
    const cancel = () => { if (preference.matches) running.forEach((animation) => animation.cancel()); };
    preference.addEventListener('change', cancel);
    return () => { observer.disconnect(); preference.removeEventListener('change', cancel); running.forEach((animation) => animation.cancel()); };
  }, []);
  return null;
}
