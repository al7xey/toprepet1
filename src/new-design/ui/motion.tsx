import { useEffect } from 'react';
import { S, tune, clamp, runSprings } from './motion-spring';
import type { Spring } from './motion-spring';

interface Control { update: () => void; cancel: () => void }

/** Bind the original Motion Studies equations to existing application controls. */
export function MotionEffects() {
  useEffect(() => {
    const controls = new Map<HTMLElement, Control>();
    const bind = (element: HTMLElement) => {
      if (controls.has(element)) { controls.get(element)!.update(); return; }
      let stop = () => {};
      let value = '';
      let update = () => {};
      const play = (springs: Spring[], render: () => void) => {
        stop();
        stop = runSprings(springs, render);
      };
      if (element.matches('.trk-tabs')) {
        // Tab Pill: independent leading and trailing edges.
        const A = S(0), B = S(0);
        let current = -1;
        update = () => {
          const tabs = Array.from(element.querySelectorAll<HTMLElement>('[role="tab"]'));
          const index = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
          const selected = tabs[index];
          const pill = element.querySelector<HTMLElement>('.trk-tab-indicator');
          if (!selected || !pill) return;
          const key = index + ':' + selected.offsetLeft + ':' + selected.offsetWidth;
          if (key === value) return;
          value = key;
          const direction = index > current ? 1 : -1;
          A.t = selected.offsetLeft; B.t = selected.offsetLeft + selected.offsetWidth;
          if (direction > 0) { tune(B, 620, 40); tune(A, 170, 19); }
          else { tune(A, 620, 40); tune(B, 170, 19); }
          if (current < 0) { A.x = A.t; B.x = B.t; }
          current = index;
          play([A, B], () => {
            pill.style.transform = 'translateX(' + A.x.toFixed(2) + 'px)';
            pill.style.width = Math.max(0, B.x - A.x).toFixed(2) + 'px';
          });
        };
      } else if (element.matches('.switch')) {
        // Toggle Switch: position + width impulse.
        const on = element.classList.contains('on');
        const p = S(on ? 1 : 0, 320, 18), w = S(0, 300, 20);
        value = String(on);
        update = () => {
          const checked = element.classList.contains('on');
          if (String(checked) === value) return;
          value = String(checked);
          p.t = checked ? 1 : 0; w.t = 0; w.v = 60;
          play([p, w], () => {
            const grow = clamp(w.x, 0, 1) * 10, x = p.x * 20;
            element.style.setProperty('--motion-knob-width', (28 + grow).toFixed(2) + 'px');
            element.style.setProperty('--motion-knob-x', (checked ? x - grow * clamp(p.x, 0, 1) : x).toFixed(2) + 'px');
          });
        };
      } else if (element.matches('.prog i, .trk-check > i, .chk > i')) {
        // Step Progress / Checkbox List: fill and check springs.
        const active = () => element.classList.contains('on') || Boolean(element.closest('.trk-check.on, .chk.on'));
        const f = S(active() ? 1 : 0, 260, 24);
        const p = S(1, 520, 13), c = S(active() ? 1 : 0, 160, 20);
        value = String(active());
        update = () => {
          const on = active();
          if (String(on) === value) return;
          value = String(on); f.t = on ? 1 : 0;
          p.x = on ? .7 : .85; p.v = 5; c.t = on ? 1 : 0;
          play([f, p, c], () => {
            element.style.setProperty('--motion-fill', clamp(f.x, 0, 1).toFixed(4));
            const icon = element.querySelector<SVGElement>('.i');
            if (icon) {
              icon.style.transform = 'scale(' + p.x.toFixed(4) + ')';
              icon.style.opacity = String(clamp(c.x, 0, 1));
            }
          });
        };
      } else {
        // Spring Dropdown panel: 300/23, opacity 400/34.
        const h = S(0, 300, 23), o = S(0, 400, 34);
        h.t = 1; o.t = 1;
        play([h, o], () => {
          element.style.opacity = String(clamp(o.x, 0, 1));
          element.style.transform = 'translateY(' + ((1 - h.x) * -8).toFixed(2) + 'px) scale(' + (.96 + .04 * h.x).toFixed(4) + ')';
        });
      }
      controls.set(element, { update, cancel: () => stop() });
      update();
    };
    const selector = '.trk-tabs, .switch, .prog i, .trk-check > i, .chk > i, .trh-drop-menu, .trh-menu, .trk-modal, .trk-toast';
    const scan = (root: Element) => {
      if (root instanceof HTMLElement && root.matches(selector)) bind(root);
      root.querySelectorAll<HTMLElement>(selector).forEach(bind);
    };
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach(node => { if (node instanceof Element) scan(node); });
        else if (record.target instanceof HTMLElement) {
          const host = record.target.closest<HTMLElement>('.trk-tabs, .switch, .prog i, .trk-check, .chk');
          if (host) scan(host);
        }
      }
      for (const [element, control] of controls) if (!element.isConnected) { control.cancel(); controls.delete(element); }
    });
    document.querySelectorAll('.tr').forEach(scan);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected'] });
    const resize = new ResizeObserver(() => controls.forEach(control => control.update()));
    document.querySelectorAll('.tr').forEach(root => resize.observe(root));
    return () => {
      observer.disconnect(); resize.disconnect();
      controls.forEach(control => control.cancel());
    };
  }, []);
  return null;
}
