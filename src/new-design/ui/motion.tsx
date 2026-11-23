import { useEffect } from 'react';
import { S, tune, clamp, runSprings } from './motion-spring';
import type { Spring } from './motion-spring';

interface Control { update: () => void; cancel: () => void }

/**
 * Adapted from the live DesignBookmark Motion studies. Each controller is tied
 * to a real UI state; gallery autoplay and sample-only controls are omitted.
 * Sources: tab-pill, toggle-switch, spring-dropdown, step-progress,
 * checkbox-list, segmented-control, dynamic-menu, rubber-dock, springy-input,
 * jelly-slider, number-stepper, range-slider, parallax-ticket, glass-lens,
 * expand-card, profile-card, stat-card, loading-success, copy-button,
 * streaming-reply, prompt-box, otp-code, star-rating, file-drop, read-along,
 * roll-links, morph-tooltip, pagination-dots, fan-cards, like-burst.
 */
export function MotionEffects() {
  useEffect(() => {
    const controls = new Map<HTMLElement, Control>();
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

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
        // Tab Pill / Segmented Control: two spring-driven edges keep labels still.
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
        // Toggle Switch: original position + width impulse equations.
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
        // Step Progress + Checkbox List: fill and check springs from the sources.
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
      } else if (element.matches('.opt, .chipf, .trk-month-day, .trk-slots .date, .trk-slots .slot')) {
        // Tag Input, Number Stepper, Range Slider: selection is a short spring,
        // while the hit target and surrounding layout remain completely fixed.
        const selected = () => element.matches('.on, .sel');
        const rim = S(selected() ? 1.5 : 0, 300, 24);
        value = String(selected());
        update = () => {
          const on = selected();
          if (String(on) === value) return;
          value = String(on); rim.t = on ? 1.5 : 0;
          play([rim], () => element.style.setProperty('--motion-selection-rim', rim.x.toFixed(2) + 'px'));
        };
      } else if (element.matches('.tc')) {
        // Profile Card / Parallax Ticket: a restrained photo-only parallax on desktop.
        const image = element.querySelector<HTMLElement>('img');
        const x = S(0, 150, 22), y = S(0, 150, 22);
        const move = (event: PointerEvent) => {
          if (!finePointer || !image) return;
          const rect = element.getBoundingClientRect();
          x.t = clamp((event.clientX - rect.left) / rect.width - .5, -.5, .5) * 2.4;
          y.t = clamp((event.clientY - rect.top) / rect.height - .5, -.5, .5) * 2.4;
          play([x, y], () => {
            image.style.setProperty('--motion-photo-x', x.x.toFixed(2) + 'px');
            image.style.setProperty('--motion-photo-y', y.x.toFixed(2) + 'px');
          });
        };
        const leave = () => {
          x.t = 0; y.t = 0;
          play([x, y], () => {
            image?.style.setProperty('--motion-photo-x', x.x.toFixed(2) + 'px');
            image?.style.setProperty('--motion-photo-y', y.x.toFixed(2) + 'px');
          });
        };
        element.addEventListener('pointermove', move, { passive: true });
        element.addEventListener('pointerleave', leave, { passive: true });
        controls.set(element, { update: () => {}, cancel: () => { stop(); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); } });
        return;
      } else {
        // Spring Dropdown / Morph Island / Loading Success: panels settle into
        // place using the source spring values, with no resize or layout jump.
        const h = S(0, 300, 23), o = S(0, 400, 34);
        h.t = 1; o.t = 1;
        play([h, o], () => {
          element.style.opacity = String(clamp(o.x, 0, 1));
          element.style.transform = 'translateY(' + ((1 - h.x) * -8).toFixed(2) + 'px) scale(' + (.985 + .015 * h.x).toFixed(4) + ')';
        });
      }
      controls.set(element, { update, cancel: () => stop() });
      update();
    };

    const selector = [
      '.trk-tabs', '.switch', '.prog i', '.trk-check > i', '.chk > i',
      '.trh-drop-menu', '.trh-menu', '.trk-modal', '.trk-toast',
      '.opt', '.chipf', '.trk-month-day', '.trk-slots .date', '.trk-slots .slot', '.tc',
    ].join(',');
    const revealSelector = '[data-motion="section-reveal"], [data-motion="card-reveal"], [data-motion="profile-card"], [data-motion="stat-card"]';
    let revealObserver: IntersectionObserver | null = null;
    if (!reduced.matches && typeof IntersectionObserver !== 'undefined') {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-motion-visible', '');
          revealObserver?.unobserve(entry.target);
        });
      }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    }
    const scan = (root: Element) => {
      if (root instanceof HTMLElement && root.matches(selector)) bind(root);
      if (root instanceof HTMLElement && root.matches(revealSelector)) revealObserver?.observe(root);
      root.querySelectorAll<HTMLElement>(selector).forEach(bind);
      root.querySelectorAll<HTMLElement>(revealSelector).forEach(element => revealObserver?.observe(element));
    };
    document.querySelectorAll('.tr').forEach(scan);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach(node => { if (node instanceof Element) scan(node); });
        else if (record.target instanceof HTMLElement) {
          const target = record.target;
          const host = target.matches(selector) ? target : target.closest<HTMLElement>(selector);
          if (host) { bind(host); controls.get(host)?.update(); }
          else target.querySelectorAll<HTMLElement>(selector).forEach(element => { bind(element); controls.get(element)?.update(); });
        }
      }
      for (const [element, control] of controls) if (!element.isConnected) { control.cancel(); controls.delete(element); }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'aria-pressed', 'open'] });
    const resize = new ResizeObserver(() => controls.forEach(control => control.update()));
    document.querySelectorAll('.tr').forEach(root => resize.observe(root));
    const onMotionPreference = () => {
      if (reduced.matches) document.querySelectorAll<HTMLElement>('[data-motion-visible]').forEach(element => { element.style.animation = 'none'; });
    };
    reduced.addEventListener('change', onMotionPreference);
    return () => {
      observer.disconnect(); resize.disconnect(); revealObserver?.disconnect();
      reduced.removeEventListener('change', onMotionPreference);
      controls.forEach(control => control.cancel());
    };
  }, []);
  return null;
}
