import { useEffect, useRef, useState } from 'react';
import { gesture, haptic } from './CalendarGestures.jsx';

// Drag an item onto another day or time slot.
// Mouse and pen: drag straight away. Touch: press and hold (like iOS and Android), so a normal swipe or
// scroll that starts on an item still pages or scrolls the calendar.
const HOLD_MS = 380, SLOP = 8;
export default function useCalendarDrag(onMove, { onEdge } = {}) {
  const current = useRef(null), move = useRef(onMove), edge = useRef(onEdge), suppressedUntil = useRef(0), startLoop = useRef(() => {});
  const [drag, setDrag] = useState(null), [over, setOver] = useState(null);
  move.current = onMove; edge.current = onEdge;
  const targetDay = (x, y) => document.elementFromPoint(x, y)?.closest('[data-calendar-date]')?.dataset.calendarDate || null;
  const clear = () => { clearTimeout(current.current?.timer); current.current = null; gesture.dragging = false; setDrag(null); setOver(null); };
  const activate = active => {
    active.moved = true; gesture.dragging = true;
    if (active.touch) haptic(12);
    setDrag({ title: active.title, x: active.x, y: active.y }); setOver(targetDay(active.x, active.y));
    startLoop.current();
  };
  useEffect(() => {
    let frame = null, edgeSince = 0;
    // While dragging: scroll near the top/bottom, scroll the time grid, and page sideways after resting at a side edge.
    const tick = () => {
      frame = null;
      const active = current.current; if (!active?.moved) return;
      const h = window.innerHeight, w = window.innerWidth;
      const vy = active.y < 70 ? -12 : active.y > h - 70 ? 12 : 0;
      if (vy) window.scrollBy({ top: vy, left: 0, behavior: 'instant' });
      const grid = document.elementFromPoint(active.x, active.y)?.closest('.cv-tg-scroll');
      if (grid) { const r = grid.getBoundingClientRect(); grid.scrollTop += active.y < r.top + 48 ? -10 : active.y > r.bottom - 48 ? 10 : 0; }
      const side = active.x < 30 ? -1 : active.x > w - 30 ? 1 : 0;
      if (!side) edgeSince = 0;
      else if (!edgeSince) edgeSince = performance.now();
      else if (performance.now() - edgeSince > 650) { edgeSince = 0; edge.current?.(side); }
      setOver(targetDay(active.x, active.y));
      frame = requestAnimationFrame(tick);
    };
    startLoop.current = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const pointerMove = event => {
      const active = current.current;
      if (!active || event.pointerId !== active.pointerId) return;
      active.x = event.clientX; active.y = event.clientY;
      if (!active.moved) {
        if (Math.hypot(active.x - active.startX, active.y - active.startY) < SLOP) return;
        if (active.touch) { clear(); return; } // moved before the hold finished: it is a swipe or scroll
        activate(active);
      }
      event.preventDefault();
      setDrag({ title: active.title, x: active.x, y: active.y });
    };
    // Non-passive, so a held item can be dragged up and down without the page scrolling underneath.
    const touchMove = event => { if (current.current?.moved) event.preventDefault(); };
    const pointerUp = event => {
      const active = current.current;
      if (!active || event.pointerId !== active.pointerId) return;
      const to = targetDay(event.clientX, event.clientY), moved = active.moved;
      clear();
      if (moved) {
        suppressedUntil.current = performance.now() + 500;
        if (event.type !== 'pointercancel' && to) move.current(active.id, active.from, to);
      }
    };
    const cancel = event => { if (!event || event.type === 'blur' || event.key === 'Escape') { if (current.current?.moved) suppressedUntil.current = performance.now() + 500; if (current.current) clear(); } };
    document.addEventListener('pointermove', pointerMove, { passive: false });
    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('pointerup', pointerUp);
    document.addEventListener('pointercancel', pointerUp);
    document.addEventListener('keydown', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      cancelAnimationFrame(frame); clearTimeout(current.current?.timer); current.current = null; gesture.dragging = false;
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('pointerup', pointerUp);
      document.removeEventListener('pointercancel', pointerUp);
      document.removeEventListener('keydown', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, []);
  const props = (event, from) => event.source === 'taskflow' ? {} : {
    draggable: false,
    onPointerDown: e => {
      if (e.button !== 0 || current.current) return;
      const touch = e.pointerType === 'touch';
      const active = { id: event.id, title: event.title, from, touch, moved: false, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY };
      if (touch) active.timer = setTimeout(() => { if (current.current === active) activate(active); }, HOLD_MS);
      else e.currentTarget.setPointerCapture?.(e.pointerId);
      current.current = active;
    },
    onContextMenu: e => e.preventDefault(), // Android long-press menu
    onClickCapture: e => { if (performance.now() < suppressedUntil.current) { e.preventDefault(); e.stopPropagation(); } },
  };
  const cellProps = date => ({ 'data-calendar-date': date });
  return { drag, over, props, cellProps };
}
