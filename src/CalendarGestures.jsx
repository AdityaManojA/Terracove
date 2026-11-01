import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { installPlatform } from './install-controller';

// Touch building blocks for the calendar: a swipe pager, pinch-to-zoom and a bottom sheet.
// Motion follows the platform: iOS uses a long, soft spring; Android and desktop a shorter Material curve.
export const platformOf = () => (typeof navigator === 'undefined' ? 'desktop' : installPlatform(navigator));
const MOTION = { ios: [420, 'cubic-bezier(.22,1,.36,1)'], android: [280, 'cubic-bezier(.2,0,0,1)'], desktop: [260, 'cubic-bezier(.2,0,0,1)'] };
const motion = platform => MOTION[platform] || MOTION.desktop;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const haptic = (ms = 10) => { try { navigator.vibrate?.(ms); } catch { /* not supported (iOS) */ } };
// Set while an item is being dragged, so the pager never fights the drag for the same finger.
export const gesture = { dragging: false };
// Leave the outer strip of the screen to the system back gesture (iOS Safari edge swipe, Android gesture nav).
const EDGE = 22;

export function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => { const mq = window.matchMedia(query), f = () => setMatch(mq.matches); f(); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, [query]);
  return match;
}

// Three panes side by side (previous, current, next). The track follows the finger 1:1; on release it settles on
// a neighbour when the swipe is long or fast enough, then the parent moves its period and the track snaps back.
export const Pager = forwardRef(function Pager({ pageKey, onStep, render, platform = 'desktop', className = '', label }, ref) {
  const host = useRef(null), track = useRef(null), touch = useRef(null), busy = useRef(false), offset = useRef(0), suppress = useRef(0), step = useRef(onStep);
  step.current = onStep;
  const place = (x, ms = 0) => {
    const el = track.current; if (!el) return;
    offset.current = x;
    el.style.transition = ms ? `transform ${ms}ms ${motion(platform)[1]}` : 'none';
    el.style.transform = `translate3d(calc(-100% + ${x}px),0,0)`;
  };
  useLayoutEffect(() => { place(0); busy.current = false; }, [pageKey]);
  const settle = (dir, speed = 0) => {
    const [base] = motion(platform);
    if (!dir) { place(0, Math.round(base * 0.8)); return; }
    if (reducedMotion()) { place(0); step.current(dir); return; }
    const width = host.current?.clientWidth || 1, left = width - Math.abs(offset.current);
    let ms = Math.max(160, Math.round(base * (left / width)));
    if (speed > 0.3) ms = Math.max(140, Math.min(ms, Math.round((left / speed) * 1.6)));
    busy.current = true;
    place(-dir * width, ms);
    setTimeout(() => step.current(dir), ms);
  };
  const go = dir => { if (!busy.current && !touch.current) settle(dir); };
  const goRef = useRef(go); goRef.current = go;
  useImperativeHandle(ref, () => ({ go: dir => goRef.current(dir) }), []);

  // Two-finger horizontal trackpad scrolls page the calendar on laptops.
  useEffect(() => {
    const el = host.current; if (!el) return;
    let sum = 0, last = 0;
    const wheel = e => {
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || e.target.closest('.cv-hscroll')) return;
      e.preventDefault();
      const now = performance.now(); if (now - last < 550) return;
      sum += e.deltaX;
      if (Math.abs(sum) > 70) { last = now; goRef.current(sum > 0 ? 1 : -1); sum = 0; }
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  const down = e => {
    if (e.pointerType === 'mouse' || busy.current || gesture.dragging) return;
    if (touch.current) { touch.current = null; place(0, 200); return; } // a second finger: leave it to pinch
    if (e.clientX < EDGE || e.clientX > window.innerWidth - EDGE) return;
    touch.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, axis: null, dx: 0, samples: [[e.timeStamp, e.clientX]] };
  };
  const move = e => {
    const s = touch.current; if (!s || e.pointerId !== s.id) return;
    if (gesture.dragging) { touch.current = null; place(0, 200); return; }
    const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
    if (!s.axis) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) { s.axis = 'x'; try { host.current.setPointerCapture(e.pointerId); } catch { /* finger already lifted */ } }
      else if (Math.abs(dy) > 10) { touch.current = null; return; }
      else return;
    }
    s.dx = dx; s.samples.push([e.timeStamp, e.clientX]); if (s.samples.length > 6) s.samples.shift();
    place(dx);
  };
  const up = e => {
    const s = touch.current; if (!s || e.pointerId !== s.id) return;
    touch.current = null;
    if (s.axis !== 'x') return;
    suppress.current = performance.now() + 350;
    if (e.type === 'pointercancel') { place(0, 200); return; }
    const [t0, x0] = s.samples[0], [t1, x1] = s.samples[s.samples.length - 1], v = (x1 - x0) / Math.max(1, t1 - t0);
    const width = host.current.clientWidth, far = Math.abs(s.dx) > width * 0.22, fast = Math.abs(v) > 0.45 && Math.sign(v) === Math.sign(s.dx);
    settle(far || fast ? (s.dx < 0 ? 1 : -1) : 0, Math.abs(v));
  };
  return <div ref={host} className={'cv-pager ' + className} aria-label={label} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
    onClickCapture={e => { if (performance.now() < suppress.current) { e.preventDefault(); e.stopPropagation(); } }}>
    <div ref={track} className="cv-track" style={{ transform: 'translate3d(-100%,0,0)' }}>
      {[-1, 0, 1].map(o => <div key={o} className="cv-pane" aria-hidden={o ? true : undefined} inert={o ? '' : undefined}>{render(o)}</div>)}
    </div>
  </div>;
});

// Pinch out to zoom in (year → month → week → day), pinch in to zoom out. One step per pinch.
export function usePinch(ref, onPinch) {
  const cb = useRef(onPinch); cb.current = onPinch;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let start = 0, fired = false;
    const gap = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const ts = e => { if (e.touches.length === 2 && !gesture.dragging) { start = gap(e.touches); fired = false; } };
    const tm = e => {
      if (e.touches.length !== 2 || !start) return;
      e.preventDefault();
      if (fired) return;
      const r = gap(e.touches) / start;
      if (r > 1.35 || r < 0.72) { fired = true; haptic(8); cb.current(r > 1 ? 1 : -1); }
    };
    const te = e => { if (e.touches.length < 2) start = 0; };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te); el.addEventListener('touchcancel', te);
    return () => { el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm); el.removeEventListener('touchend', te); el.removeEventListener('touchcancel', te); };
  }, [ref]);
}

// Bottom sheet on phones (drag the handle down to dismiss, system back closes it); side panel on larger screens.
export function Sheet({ open, onClose, title, label, platform = 'desktop', compact, children }) {
  const panel = useRef(null), pull = useRef(null), close = useRef(onClose), [leaving, setLeaving] = useState(false);
  close.current = onClose;
  const [ms] = motion(platform);
  const requestClose = () => {
    if (reducedMotion()) { close.current(); return; }
    setLeaving(true);
    setTimeout(() => { setLeaving(false); close.current(); }, Math.round(ms * 0.75));
  };
  const closer = useRef(requestClose); closer.current = requestClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    panel.current?.focus({ preventScroll: true });
    const key = e => { if (e.key === 'Escape') closer.current(); };
    window.addEventListener('keydown', key);
    // Phones: the hardware / gesture back closes the sheet instead of leaving the page.
    let pushed = false;
    if (compact) { history.pushState({ ...(history.state || {}), cvSheet: true }, ''); pushed = true; }
    const pop = () => { pushed = false; close.current(); };
    window.addEventListener('popstate', pop);
    const html = document.documentElement, overflow = html.style.overflow;
    if (compact) html.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key); window.removeEventListener('popstate', pop);
      html.style.overflow = overflow;
      if (pushed && history.state?.cvSheet) history.back();
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, compact]);

  const down = e => {
    if (!compact || e.target.closest('button,a,input,select')) return;
    pull.current = { y0: e.clientY, y: 0, samples: [[e.timeStamp, e.clientY]] };
    e.currentTarget.setPointerCapture(e.pointerId);
    panel.current.style.transition = 'none';
  };
  const move = e => {
    const s = pull.current; if (!s) return;
    const dy = e.clientY - s.y0;
    s.y = dy < 0 ? (platform === 'ios' ? dy / 5 : 0) : dy; // iOS stretches a little upwards; Android stays put
    s.samples.push([e.timeStamp, e.clientY]); if (s.samples.length > 6) s.samples.shift();
    panel.current.style.transform = `translate3d(0,${s.y}px,0)`;
  };
  const up = () => {
    const s = pull.current; if (!s) return;
    pull.current = null;
    const [t0, y0] = s.samples[0], [t1, y1] = s.samples[s.samples.length - 1], v = (y1 - y0) / Math.max(1, t1 - t0);
    panel.current.style.transition = '';
    if (s.y > panel.current.offsetHeight * 0.3 || v > 0.5) { panel.current.style.transform = 'translate3d(0,110%,0)'; setTimeout(() => close.current(), Math.round(ms * 0.7)); }
    else panel.current.style.transform = '';
  };
  if (!open) return null;
  return createPortal(<div className={'cv-sheet ' + (compact ? 'is-bottom' : 'is-side') + (leaving ? ' is-leaving' : '')} data-platform={platform}>
    <div className="cv-scrim" onClick={requestClose} />
    <section ref={panel} className="cv-sheet-panel" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      <div className="cv-sheet-grab" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {compact && <span className="cv-grabber" aria-hidden="true" />}
        <div className="cv-sheet-head"><b>{title}</b><button type="button" className="cv-icon" aria-label="Close" onClick={requestClose}><Icon name="close" size={20} /></button></div>
      </div>
      <div className="cv-sheet-body">{children}</div>
    </section>
  </div>, document.body);
}
