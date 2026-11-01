import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { calendarEvents, calendarIcs } from '../functions/calendar';
import { download, today } from './lib';
import { localDay, monthDays, onDay, matchesCalendarFilters, sortCalendarItems, ZOOMS, zoomRange, shiftZoom, spanLanes, rangeFraction, layoutTimed, addDaysKey, weekStartKey, dayLoad } from './calendar-view';
import Icon from './Icon';
import { Select, DateInput } from './Controls';
import { moveCalendarItem } from './calendar-move';
import useCalendarDrag from './useCalendarDrag';
import { TaskflowStatus } from './TaskflowPanel';
import { useViewState } from './ViewState.jsx';
import { taskflowCalendarEvents } from './taskflow-data';
import { CalendarPlanning } from './ProductivityUI.jsx';
import { scheduleTask } from './productivity';
import { Pager, Sheet, useMedia, usePinch, platformOf } from './CalendarGestures.jsx';

const HOUR = 52;
const LABEL = { year: 'Year', month: 'Month', week: 'Week', day: 'Day' };
const LOAD = { free: 'Free', light: 'Light', busy: 'Busy', packed: 'Packed' };
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Each client gets a palette colour in a stable order; work without a client uses the card colour.
const TONES = ['var(--hero)', 'var(--sage)', 'var(--sand)', 'var(--hero-deep)', 'var(--sage-deep)', 'var(--sand-deep)'];
const fmt = (day, o) => new Date(day + 'T12:00:00').toLocaleDateString(undefined, o);
const clock = iso => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const shared = e => e.source === 'taskflow';
const validDay = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T12:00:00'));
const loadText = (load, day, t) => load.count ? `${load.count} item${load.count === 1 ? '' : 's'}${load.clients > 1 ? ` · ${load.clients} clients` : ''}` : day >= t ? 'Free' : 'Nothing scheduled';

function LoadLegend() {
  return <div className="cv-legend" aria-label="How full each day is">{Object.entries(LOAD).map(([k, l]) => <span key={k}><i className={'load-' + k} />{l}{k === 'light' ? ' 1–2' : k === 'busy' ? ' 3–4' : k === 'packed' ? ' 5+' : ''}</span>)}</div>;
}

export default function Calendar({ d, mut, open, user, taskflow, toast = () => {} }) {
  const [savedDay, setDay] = useViewState('calendar.day', today), [savedZoom, setZoom] = useViewState('calendar.zoom', 'month');
  const day = validDay(savedDay) ? savedDay : today(), zoom = ZOOMS.includes(savedZoom) ? savedZoom : 'month';
  const [client, setClient] = useViewState('calendar.client', ''), [showShared, setShowShared] = useViewState('calendar.shared', true), [completed, setCompleted] = useViewState('calendar.completed', false);
  const [eventId, setEventId] = useState(null), [options, setOptions] = useState(false), [status, setStatus] = useState('');
  const platform = useMemo(platformOf, []), compact = useMedia('(max-width: 760px)');
  const root = useRef(null), pager = useRef(null);
  const t = today();

  const toneOf = useMemo(() => { const order = d.clients.map(c => c.id); return id => id && order.includes(id) ? TONES[order.indexOf(id) % TONES.length] : null; }, [d.clients]);
  const tone = e => shared(e) ? {} : { '--tone': toneOf(e.client?.id) || 'var(--card)', '--tone-ink': toneOf(e.client?.id) ? '#141414' : 'var(--tx)' };
  const sharedItems = useMemo(() => showShared ? taskflowCalendarEvents(taskflow.data) : [], [taskflow.data, showShared]);
  // Ongoing projects (no end date) run on from their start date in every view.
  const own = useMemo(() => calendarEvents(d, { includeCompleted: completed }).map(e => e.ongoing ? { ...e, end: addDaysKey(today(), 3650), description: e.description + ' · ongoing' } : e), [d, completed]);
  const events = useMemo(() => [...own, ...sharedItems].filter(e => matchesCalendarFilters(e, client, '')).sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id)), [own, sharedItems, client]);
  const range = zoomRange(zoom, day);
  const selected = events.find(e => e.id === eventId);

  // Home's Today items open this day and item, even after another calendar filter was saved.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || ''), date = params.get('day');
    if (!validDay(date || '')) return;
    setDay(date); setZoom('day'); setClient('');
    if (params.get('event')) setEventId(params.get('event'));
  }, []);
  useEffect(() => { if (!status) return; const timer = setTimeout(() => setStatus(''), 5000); return () => clearTimeout(timer); }, [status]);

  const moveItem = (id, from, to) => {
    if (to.includes('|') && (id.startsWith('task-') || id.startsWith('unscheduled-'))) {
      const [date, time] = to.split('|'), taskId = id.replace(/^(task-|unscheduled-)/, '');
      try { mut(n => scheduleTask(n, taskId, date, time, n.tasks.find(x => x.id === taskId)?.durationMinutes || 60)); setStatus(`Scheduled for ${fmt(date, { weekday: 'short', day: 'numeric', month: 'short' })} at ${time}.`); } catch (e) { setStatus(e.message); }
      return;
    }
    to = to.split('|')[0];
    if (from === to && !id.startsWith('unscheduled-')) return;
    try { let changed = false; mut(w => { changed = moveCalendarItem(w, id, from, to); }); if (changed) setStatus('Moved to ' + fmt(to, { weekday: 'short', day: 'numeric', month: 'long' }) + '.'); } catch (e) { setStatus(e.message); }
  };
  const { drag, over, props: dragProps, cellProps } = useCalendarDrag(moveItem, { onEdge: dir => pager.current?.go(dir) });
  const exportEvents = (items, name) => download(name + '.ics', calendarIcs(items, { namespace: user?.uid || 'demo', origin: window.location.origin }), 'text/calendar;charset=utf-8');
  const edit = e => { const record = e.type === 'task' ? d.tasks.find(x => 'task-' + x.id === e.id) : d.projects.find(p => 'project-' + p.id === e.id); if (record) { setEventId(null); open(e.type, record); } };
  const addTask = date => open('task', { due: date || (zoom === 'day' || zoom === 'month' ? day : undefined) });
  const zoomTo = (z, date) => { if (date) setDay(date); setZoom(z); };
  const zoomBy = dir => setZoom(z => ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, ZOOMS.indexOf(ZOOMS.includes(z) ? z : 'month') + dir))]);
  const step = dir => pager.current ? pager.current.go(dir) : setDay(shiftZoom(zoom, day, dir));
  const stepRef = useRef(step); stepRef.current = step;
  usePinch(root, zoomBy);

  // Ctrl/⌘ + scroll and trackpad pinch (reported as Ctrl + wheel) zoom the calendar, not the page.
  useEffect(() => {
    const el = root.current; if (!el) return;
    let last = 0;
    const wheel = e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); const now = Date.now(); if (now - last < 350 || Math.abs(e.deltaY) < 2) return; last = now; zoomBy(e.deltaY < 0 ? 1 : -1); };
    el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel);
  }, []);
  useEffect(() => {
    const keys = e => {
      if (e.target.closest('input,textarea,select,[contenteditable]') || document.querySelector('[role=dialog]')) return;
      const z = { y: 'year', m: 'month', w: 'week', d: 'day' }[e.key.toLowerCase()];
      if (z && !e.metaKey && !e.ctrlKey && !e.altKey) setZoom(z);
      if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey) setDay(today());
      if (e.altKey && e.key === 'ArrowLeft') stepRef.current(-1);
      if (e.altKey && e.key === 'ArrowRight') stepRef.current(1);
    };
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  }, []);

  const label = zoom === 'year' ? day.slice(0, 4)
    : zoom === 'month' ? fmt(day, { month: 'long', ...(compact ? {} : { year: 'numeric' }) })
    : zoom === 'week' ? `${fmt(range.start, { day: 'numeric', month: 'short' })} – ${fmt(addDaysKey(range.end, -1), { day: 'numeric', month: 'short' })}`
    : fmt(day, compact ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'long', day: 'numeric', month: 'long' });
  const crumb = zoom === 'month' ? day.slice(0, 4) : zoom === 'week' ? fmt(day, { month: 'long', year: 'numeric' }) : zoom === 'day' ? 'Week of ' + fmt(weekStartKey(day), { day: 'numeric', month: 'short' }) : '';
  const filtered = !!client || !showShared || completed;
  const inView = zoom === 'year' || zoom === 'month' ? t.slice(0, zoom === 'year' ? 4 : 7) === day.slice(0, zoom === 'year' ? 4 : 7) : t >= range.start && t < range.end;
  const shared3 = { events, t, toneOf, tone, dragProps, cellProps, over, onOpen: setEventId };
  const pagerProps = { ref: pager, platform, onStep: dir => setDay(shiftZoom(zoom, day, dir)) };

  return <section ref={root} className={'cv cv-z-' + zoom + (compact ? ' is-compact' : '')} data-platform={platform} aria-label="Calendar">
    <header className="cv-head">
      <div className="cv-head-top">
        <button type="button" className="cv-title" onClick={() => zoomBy(-1)} disabled={zoom === 'year'} title={zoom === 'year' ? undefined : 'Zoom out (or pinch in)'}>
          {crumb && <span className="cv-crumb"><Icon name="left" size={14} />{crumb}</span>}
          <h1 aria-live="polite">{label}</h1>
        </button>
        <div className="cv-actions">
          <button type="button" className={'cv-pill' + (inView ? ' is-now' : '')} onClick={() => setDay(t)}>Today</button>
          {!compact && <div className="cv-step"><button type="button" className="cv-icon" aria-label={'Previous ' + zoom} onClick={() => step(-1)}><Icon name="left" size={20} /></button><button type="button" className="cv-icon" aria-label={'Next ' + zoom} onClick={() => step(1)}><Icon name="arrow" size={20} /></button></div>}
          <button type="button" className={'cv-icon' + (filtered ? ' has-dot' : '')} aria-label={'Calendar options' + (filtered ? ', filters on' : '')} onClick={() => setOptions(true)}><Icon name="more" size={20} /></button>
          {!compact && <button type="button" className="btn cv-add" onClick={() => addTask()}><Icon name="plus" size={18} />Add task</button>}
          {compact && platform !== 'android' && <button type="button" className="cv-icon cv-add-icon" aria-label="Add task" onClick={() => addTask()}><Icon name="plus" size={22} /></button>}
        </div>
      </div>
      <div className="cv-seg" role="tablist" aria-label="Zoom level" style={{ '--i': ZOOMS.indexOf(zoom) }}>
        <span className="cv-seg-thumb" aria-hidden="true" />
        {ZOOMS.map(z => <button key={z} type="button" role="tab" aria-selected={zoom === z} onClick={() => setZoom(z)}>{LABEL[z]}</button>)}
      </div>
    </header>

    <p className={'cv-status' + (drag || status ? ' is-on' : '')} role="status" aria-live="polite">{drag ? `Moving “${drag.title}”${over ? ' → ' + over.replace('|', ' at ') : compact ? ' · drop on a day' : ' · drop on a day or time, Escape cancels'}` : status}</p>

    <div className="cv-body">
      <div className="cv-main">
        {zoom === 'year' && <Pager {...pagerProps} pageKey={day.slice(0, 4)} className="cv-year-pager" label="Year. Swipe sideways for other years."
          render={o => <YearPane year={String(+day.slice(0, 4) + o)} events={events} t={t} onDay={k => zoomTo(compact ? 'month' : 'day', k)} onMonth={m => zoomTo('month', m + '-01')} />} />}

        {zoom === 'month' && <>
          <Pager {...pagerProps} pageKey={day.slice(0, 7)} label="Month. Swipe sideways for other months."
            render={o => <MonthPane {...shared3} month={shiftZoom('month', day, o).slice(0, 7)} day={day} compact={compact}
              onTap={k => compact && k === day ? zoomTo('day', k) : setDay(k)} onOpenDay={k => zoomTo('day', k)} />} />
        </>}

        {zoom === 'day' && <WeekStrip day={day} events={events} t={t} platform={platform} onPick={setDay} onStep={dir => setDay(addDaysKey(day, 7 * dir))} />}
        {(zoom === 'week' || zoom === 'day') && <TimeScroller zoom={zoom} anchor={range.start} t={t}>
          <Pager {...pagerProps} pageKey={range.start} label={zoom === 'week' ? 'Week. Swipe sideways for other weeks.' : 'Day. Swipe sideways for other days.'}
            render={o => { const s = zoomRange(zoom, shiftZoom(zoom, day, o)).start; return <TimePane {...shared3} compact={compact} days={zoom === 'week' ? Array.from({ length: 7 }, (_, i) => addDaysKey(s, i)) : [s]} onPickDay={k => zoomTo('day', k)} />; }} />
        </TimeScroller>}
      </div>
      {(zoom === 'month' || zoom === 'day') && <Agenda d={d} day={day} t={t} zoom={zoom} events={events} tone={tone} onOpen={setEventId} onOpenDay={k => zoomTo('day', k)} addTask={addTask} />}
    </div>

    {zoom === 'day' && <div className="cv-planning"><CalendarPlanning d={d} mut={mut} day={day} taskflow={taskflow} toast={toast} dragProps={dragProps} events={[...own, ...sharedItems]} /></div>}
    <Timeline d={d} zoom={zoom} day={day} toneOf={toneOf} completed={completed} client={client} compact={compact} onOpen={setEventId} onPickDay={k => zoomTo(zoom === 'year' ? 'month' : 'day', k)} />
    <footer className="cv-foot"><TaskflowStatus taskflow={taskflow} /><a className="text-link" href="#/integrations">Google & Apple Calendar setup →</a></footer>

    {compact && platform === 'android' && <button type="button" className="cv-fab" aria-label="Add task" onClick={() => addTask()}><Icon name="plus" size={24} /></button>}
    {drag?.x != null && <div className="cv-drag-ghost" aria-hidden="true" style={{ left: Math.min(drag.x - 20, window.innerWidth - 200), top: Math.max(8, drag.y - (compact ? 64 : 44)) }}>{drag.title}</div>}

    <Sheet open={!!selected} onClose={() => setEventId(null)} platform={platform} compact={compact} label="Calendar item" title={selected ? (shared(selected) ? 'Shared by Levern' : selected.type === 'task' ? 'Task' : 'Project') : ''}>
      {selected && <EventDetails e={selected} tone={tone} onMove={moveItem} onEdit={() => edit(selected)} onExport={() => exportEvents([selected], 'terracove-' + selected.id)}
        onShowDay={() => { setEventId(null); zoomTo('day', localDay(selected.start) < range.start && selected.allDay ? range.start : localDay(selected.start)); }} />}
    </Sheet>
    <Sheet open={options} onClose={() => setOptions(false)} platform={platform} compact={compact} label="Calendar options" title="Calendar options">
      <div className="cv-options">
        <label className="cv-field">Show client<Select aria-label="Show client" value={client} onChange={e => setClient(e.target.value)}><option value="">All clients</option>{d.clients.filter(c => !c.arch).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
        <label className="cv-switch"><span><b>Levern & Google</b><small>Read-only items shared by Levern</small></span><input type="checkbox" role="switch" checked={showShared} onChange={e => setShowShared(e.target.checked)} /></label>
        <label className="cv-switch"><span><b>Completed work</b><small>Finished tasks and projects</small></span><input type="checkbox" role="switch" checked={completed} onChange={e => setCompleted(e.target.checked)} /></label>
        <LoadLegend />
        <div className="cv-option-actions">
          <button type="button" className="ghost" onClick={() => exportEvents(events.filter(e => e.allDay ? e.end > range.start && e.start < range.end : Date.parse(e.end) > new Date(range.start + 'T00:00:00').getTime() && Date.parse(e.start) < new Date(range.end + 'T00:00:00').getTime()).map(e => e.ongoing ? { ...e, end: addDaysKey(e.start, 1) } : e), `terracove-${zoom}-${range.start}`)}>Export this {zoom} · ICS</button>
          <a className="ghost" href="#/planner"><Icon name="planner" size={18} />Plan your day</a>
        </div>
        <p className="form-help">{compact ? 'Swipe sideways to change the ' + zoom + ', pinch to zoom, tap the title to zoom out, and press and hold an item to drag it to another day.' : 'Swipe with two fingers or use Alt + ← → to change the ' + zoom + '. Ctrl/⌘ + scroll zooms. Keys: Y M W D, T for today. Drag items to move them.'}</p>
      </div>
    </Sheet>
  </section>;
}

function YearPane({ year, events, t, onDay, onMonth }) {
  const loads = useMemo(() => { const m = new Map(); for (let k = year + '-01-01'; k <= year + '-12-31'; k = addDaysKey(k, 1)) m.set(k, dayLoad(events, k).level); return m; }, [events, year]);
  return <div className="cv-year">{Array.from({ length: 12 }, (_, i) => {
    const m = `${year}-${String(i + 1).padStart(2, '0')}`;
    return <section key={m} className={'cv-mini' + (t.slice(0, 7) === m ? ' is-now' : '')}>
      <button type="button" className="cv-mini-title" onClick={() => onMonth(m)}>{fmt(m + '-15', { month: 'long' })}</button>
      <div className="cv-mini-grid">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, j) => <span key={j} className="dow">{x}</span>)}
        {monthDays(m).map(k => k.slice(0, 7) !== m ? <span key={k} /> : <button type="button" key={k} onClick={() => onDay(k)} className={'load-' + loads.get(k) + (k === t ? ' is-today' : '')} aria-label={fmt(k, { dateStyle: 'full' }) + ', ' + LOAD[loads.get(k)]}>{+k.slice(8)}</button>)}</div>
    </section>;
  })}</div>;
}

// Month: a quiet grid. Each day lists its tasks and events (projects live in the timeline and the day panel).
function MonthPane({ month, day, events, t, compact, tone, dragProps, cellProps, over, onTap, onOpenDay, onOpen }) {
  const weeks = useMemo(() => { const g = monthDays(month); return Array.from({ length: 6 }, (_, i) => g.slice(i * 7, i * 7 + 7)); }, [month]);
  const itemsOn = k => sortCalendarItems(events.filter(e => e.type !== 'project' && onDay(e, k)));
  return <div className="cv-month" role="grid" aria-label={fmt(month + '-01', { month: 'long', year: 'numeric' })}>
    <div className="cv-dow" role="row">{DOW.map(x => <span key={x} role="columnheader" aria-label={x}>{compact ? x[0] : x}</span>)}</div>
    {weeks.map(week => <div className="cv-week" role="row" key={week[0]}>
      {week.map(k => {
        const items = itemsOn(k), load = dayLoad(events, k);
        const cls = 'cv-cell' + (k.slice(0, 7) !== month ? ' is-out' : '') + (k === t ? ' is-today' : '') + (k === day ? ' is-sel' : '') + (over === k ? ' is-drop' : '');
        const name = fmt(k, { dateStyle: 'full' }) + ', ' + (items.length ? `${items.length} item${items.length === 1 ? '' : 's'}` : loadText(load, k, t));
        if (compact) return <button key={k} type="button" role="gridcell" aria-selected={k === day} aria-label={name} className={cls} {...cellProps(k)} onClick={() => onTap(k)}>
          <span className="cv-num">{+k.slice(8)}</span>
          <span className="cv-dots" aria-hidden="true">{items.slice(0, 3).map(e => <i key={e.id} className={shared(e) ? 'shared' : ''} style={tone(e)} />)}</span>
        </button>;
        const shown = items.length > 3 ? items.slice(0, 2) : items, extra = items.length - shown.length;
        return <div key={k} role="gridcell" aria-selected={k === day} className={cls} {...cellProps(k)} onClick={() => onTap(k)}>
          <button type="button" className="cv-num" onClick={ev => { ev.stopPropagation(); onOpenDay(k); }} aria-label={name + ', open day'}>{+k.slice(8)}{k.slice(8) === '01' && <small>{fmt(k, { month: 'short' })}</small>}</button>
          {shown.map(e => <button key={e.id} type="button" className={'cv-item' + (shared(e) ? ' shared' : '')} style={tone(e)} {...dragProps(e, k)} onClick={ev => { ev.stopPropagation(); onOpen(e.id); }} title={e.title}>
            <i aria-hidden="true" />{!e.allDay && <time>{clock(e.start)}</time>}<span>{e.title}</span></button>)}
          {extra > 0 && <button type="button" className="cv-more" onClick={ev => { ev.stopPropagation(); onOpenDay(k); }}>{extra} more</button>}
        </div>;
      })}
    </div>)}
  </div>;
}

function WeekStrip({ day, events, t, platform, onPick, onStep }) {
  const ws = weekStartKey(day);
  return <Pager platform={platform} pageKey={ws} onStep={onStep} className="cv-strip" label="Week. Swipe sideways for other weeks."
    render={o => { const s = addDaysKey(ws, 7 * o); return <div className="cv-strip-days">{Array.from({ length: 7 }, (_, i) => { const k = addDaysKey(s, i), load = dayLoad(events, k);
      return <button key={k} type="button" aria-pressed={k === day} aria-label={fmt(k, { dateStyle: 'full' }) + ', ' + loadText(load, k, t)} className={'cv-strip-day' + (k === day ? ' is-sel' : '') + (k === t ? ' is-today' : '')} onClick={() => onPick(k)}>
        <small>{fmt(k, { weekday: 'narrow' })}</small><b>{+k.slice(8)}</b><i className={'load-' + load.level} aria-hidden="true" /></button>; })}</div>; }} />;
}

// One vertical scroller shared by all three pager panes, so swiping keeps the same hours in view.
function TimeScroller({ zoom, anchor, t, children }) {
  const ref = useRef(null);
  useEffect(() => { const el = ref.current; if (!el) return; const now = new Date(); el.scrollTop = Math.max(0, (anchor <= t && t < addDaysKey(anchor, zoom === 'week' ? 7 : 1) ? now.getHours() - 1.5 : 7.5) * HOUR); }, [zoom]);
  return <div ref={ref} className="cv-tg-scroll">{children}</div>;
}

function TimePane({ days, events, t, compact, tone, dragProps, cellProps, over, onOpen, onPickDay }) {
  const [, tick] = useState(0);
  useEffect(() => { const timer = setInterval(() => tick(x => x + 1), 60000); return () => clearInterval(timer); }, []);
  const now = new Date(), nowTop = (now.getHours() * 60 + now.getMinutes()) / 60 * HOUR;
  const [expanded, setExpanded] = useState(false);
  const allLanes = spanLanes(events.filter(e => e.allDay), days), total = allLanes.reduce((n, s) => Math.max(n, s.lane + 1), 0);
  // Phones keep the hours in view: two all-day rows, the rest behind "+N".
  const cap = compact && !expanded && total > 3 ? 2 : total, allDay = allLanes.filter(s => s.lane < cap), lanes = Math.min(total, cap) + (cap < total || expanded && compact && total > 3 ? 1 : 0);
  const narrow = compact && days.length > 1;
  return <div className={'cv-tg' + (days.length === 1 ? ' single' : '') + (narrow ? ' narrow' : '')} style={{ '--cols': days.length }}>
    <div className="cv-tg-top">
      {days.length > 1 && <div className="cv-tg-head"><span />{days.map(k => <button key={k} type="button" className={'cv-tg-day' + (k === t ? ' is-today' : '')} onClick={() => onPickDay(k)} aria-label={'Open ' + fmt(k, { dateStyle: 'full' })}>
        <small>{fmt(k, { weekday: narrow ? 'narrow' : 'short' })}</small><b>{+k.slice(8)}</b><i className={'load-' + dayLoad(events, k).level} aria-hidden="true" /></button>)}</div>}
      <div className="cv-tg-allday" style={{ minHeight: Math.max(1, lanes) * 26 + 8 }}>
        <span className="cv-tg-label">{narrow ? '' : 'All day'}</span>
        {days.map((k, i) => <div key={k} className={'cv-tg-allcell' + (over === k ? ' is-drop' : '')} style={{ gridColumn: i + 2, gridRow: 1 }} {...cellProps(k)} />)}
        {allDay.map(s => <button key={s.event.id} type="button" className={'cv-span' + (s.before ? ' cut-l' : '') + (s.after ? ' cut-r' : '') + (shared(s.event) ? ' shared' : '')}
          style={{ gridColumn: `${s.col + 2} / span ${s.span}`, gridRow: 1, marginTop: 4 + s.lane * 26, ...tone(s.event) }} {...dragProps(s.event, days[s.col])} onClick={() => onOpen(s.event.id)} title={s.event.title}>{s.event.type === 'task' && !narrow ? 'Due · ' : ''}{s.event.title}</button>)}
        {compact && total > 3 && <button type="button" className="cv-allday-more" style={{ gridColumn: '2 / -1', gridRow: 1, marginTop: 4 + Math.min(total, cap) * 26 }} onClick={() => setExpanded(x => !x)}>{expanded ? 'Show less' : `+${allLanes.length - allDay.length} more all-day`}</button>}
      </div>
    </div>
    <div className="cv-tg-body" style={{ height: 24 * HOUR }}>
      <div className="cv-tg-hours" aria-hidden="true">{Array.from({ length: 24 }, (_, h) => <span key={h} style={{ top: h * HOUR }}>{h ? new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: 'numeric' }) : ''}</span>)}</div>
      {days.map(k => <div key={k} className={'cv-tg-col' + (k === t ? ' is-today' : '')}>
        {Array.from({ length: 24 }, (_, h) => { const slot = k + '|' + String(h).padStart(2, '0') + ':00'; return <div key={h} className={'cv-tg-slot' + (over === slot ? ' is-drop' : '')} style={{ top: h * HOUR, height: HOUR }} {...cellProps(slot)} />; })}
        {layoutTimed(events, k).map(r => { const height = Math.max(22, r.height / 60 * HOUR - 2);
          return <button key={r.event.id} type="button" className={'cv-ev' + (shared(r.event) ? ' shared' : '') + (height < 40 ? ' short' : '')}
            style={{ top: r.top / 60 * HOUR + 1, height, left: `calc(${r.col / r.cols * 100}% + 2px)`, width: `calc(${100 / r.cols}% - 4px)`, ...tone(r.event) }} {...dragProps(r.event, k)} onClick={() => onOpen(r.event.id)}>
            <b>{r.event.title}</b>{!narrow && <small>{clock(r.event.start)}{r.event.reminder ? '' : ' – ' + clock(r.event.end)}{r.event.client ? ' · ' + r.event.client.name : ''}</small>}</button>; })}
        {k === t && <span className="cv-now" style={{ top: nowTop }} aria-hidden="true" />}
      </div>)}
    </div>
  </div>;
}

// The selected day, explained: what is due, what is scheduled, which projects are running.
function Agenda({ d, day, t, zoom, events, tone, onOpen, onOpenDay, addTask }) {
  const items = sortCalendarItems(events.filter(e => onDay(e, day)));
  const timed = items.filter(e => !e.allDay && !e.reminder), due = items.filter(e => (e.allDay || e.reminder) && e.type !== 'project'), running = items.filter(e => e.type === 'project');
  const minutes = timed.filter(e => !shared(e)).reduce((n, e) => n + (e.durationMinutes || 0), 0);
  const progress = e => { const p = d.projects.find(x => 'project-' + x.id === e.id), all = p ? d.tasks.filter(x => x.project === p.id && !x.arch) : []; return [e.client?.name || 'No client', all.length && `${all.filter(x => x.status === 'Done').length}/${all.length} tasks`, e.ongoing ? 'ongoing' : 'until ' + fmt(addDaysKey(e.end, -1), { day: 'numeric', month: 'short' })].filter(Boolean).join(' · '); };
  const row = (e, when, meta) => <li key={e.id}><button type="button" className={'cv-row' + (shared(e) ? ' shared' : '')} style={tone(e)} onClick={() => onOpen(e.id)}>
    <span className="cv-row-when">{when}</span><span className="cv-row-bar" aria-hidden="true" /><span className="cv-row-text"><b>{e.title}</b><small>{meta}</small></span></button></li>;
  const group = (title, list, when, meta) => list.length > 0 && <section className="cv-group"><h3>{title}</h3><ul>{list.map(e => row(e, when(e), meta(e)))}</ul></section>;
  return <aside className="cv-agenda" aria-label={'Plan for ' + fmt(day, { dateStyle: 'full' })}>
    <div className="cv-agenda-head">
      <div><span className="cv-eyebrow">{day === t ? 'Today' : fmt(day, { weekday: 'long' })}</span><h2>{fmt(day, { day: 'numeric', month: 'long' })}</h2></div>
      {zoom === 'month' && <button type="button" className="ghost sm" onClick={() => onOpenDay(day)}>Open day</button>}
    </div>
    <div className="cv-stats"><span><b>{timed.length}</b><small>Scheduled</small></span><span><b>{Math.round(minutes / 6) / 10}h</b><small>Booked</small></span><span><b>{due.length}</b><small>Due</small></span></div>
    {items.length ? <>
      {group('Due', due, () => 'All day', e => shared(e) ? 'Levern · read only' : [e.client?.name, e.projectName, e.priority && e.priority + ' priority'].filter(Boolean).join(' · ') || 'Deadline')}
      {group('Scheduled', timed, e => clock(e.start), e => `until ${clock(e.end)}${e.client ? ' · ' + e.client.name : ''}${shared(e) ? ' · read only' : ''}`)}
      {group('Projects running', running, () => '', progress)}
    </> : <p className="cv-empty">{day >= t ? 'Nothing planned. This day is free.' : 'Nothing was scheduled on this day.'}</p>}
    <button type="button" className="ghost cv-agenda-add" onClick={() => addTask(day)}><Icon name="plus" size={18} />Add task for this day</button>
  </aside>;
}

function EventDetails({ e, tone, onMove, onEdit, onExport, onShowDay }) {
  const from = localDay(e.start), [date, setDate] = useState(from), isShared = shared(e);
  useEffect(() => setDate(localDay(e.start)), [e.id, e.start]);
  const t = today(), quick = [['Today', t], ['Tomorrow', addDaysKey(t, 1)], ['+1 week', addDaysKey(from, 7)]];
  const when = e.allDay ? (e.ongoing ? `Ongoing since ${fmt(e.start, { day: 'numeric', month: 'short', year: 'numeric' })}` : addDaysKey(e.start, 1) < e.end ? `${fmt(e.start, { day: 'numeric', month: 'short' })} – ${fmt(addDaysKey(e.end, -1), { day: 'numeric', month: 'short', year: 'numeric' })}` : fmt(e.start, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · all day')
    : `${fmt(localDay(e.start), { weekday: 'long', day: 'numeric', month: 'long' })} · ${clock(e.start)}${e.reminder ? ' (due-time reminder)' : ' – ' + clock(e.end)}`;
  return <div className={'cv-detail' + (isShared ? ' shared' : '')} style={tone(e)}>
    <span className="cv-detail-tag">{isShared ? (e.reminder ? 'From Levern · read only' : 'Google Calendar via Levern · read only') : e.type === 'task' ? 'Task' : 'Project'}</span>
    <h2>{e.title}</h2>
    <dl className="cv-facts">
      <div><dt>When</dt><dd>{when}</dd></div>
      {!e.allDay && !e.reminder && e.durationMinutes ? <div><dt>Length</dt><dd>{e.durationMinutes} minutes</dd></div> : null}
      <div><dt>Client</dt><dd>{e.client?.name || 'No client'}</dd></div>
      <div><dt>Shows as</dt><dd>{e.availability === 'busy' ? 'Busy' : 'Free'}</dd></div>
    </dl>
    {e.description && <p className="cv-desc">{e.description}</p>}
    {!isShared && <section className="cv-move">
      <h3>Move</h3>
      <div className="cv-quick">{quick.map(([l, k]) => <button key={l} type="button" className="cv-pill" disabled={k === from} onClick={() => onMove(e.id, from, k)}>{l}</button>)}</div>
      <div className="cv-move-row"><label>Date<DateInput aria-label="Move to date" value={date} onChange={ev => setDate(ev.target.value)} /></label><button type="button" className="btn" disabled={!date || date === from} onClick={() => onMove(e.id, from, date)}>Move {e.type}</button></div>
      <p className="form-help">Task times and project lengths stay the same. Moving a timed task also shifts its deadline; moving a project shifts its timeline only.</p>
    </section>}
    <div className="cv-detail-actions">
      {isShared ? <a className="btn" href={e.url} target="_blank" rel="noopener noreferrer">Open in {e.reminder ? 'Levern' : 'source calendar'} ↗</a> : <><button type="button" className="btn" onClick={onEdit}>Edit {e.type}</button>{e.type === 'project' && <a className="ghost" href={'#/projects/' + e.projectId}>Open project</a>}</>}
      <button type="button" className="ghost" onClick={onShowDay}>Show day</button>
      <button type="button" className="ghost" onClick={onExport}>Export · ICS</button>
    </div>
    <p className="form-help">{isShared && 'Shared live by Levern; change it in its source app. '}Exported ICS files are copies; later edits here won’t update them.</p>
  </div>;
}

// "What you're working on": dated projects as bars, one row per client.
// Month, week and day show a strip of days that grows as you scroll, so you can slide as far as you like:
// drag it with the mouse, swipe it on a phone, or use the arrows. The year fits the width (phones scroll it).
const SLIDE_DAYS = 60, EDGE_PX = 240, LANE = 34, CHAR = 6.6;
function Timeline({ d, zoom, day, toneOf, completed, client, compact, onOpen, onPickDay }) {
  const period = zoom === 'day' ? 'week' : zoom, range = zoomRange(period, day), t = today(), sliding = period !== 'year';
  const col = sliding ? (compact ? 38 : 44) : compact ? 72 : 0;
  const around = () => ({ start: addDaysKey(range.start, -28), end: addDaysKey(range.end, 56) });
  const [win, setWin] = useState(around), [mid, setMid] = useState(range.start), [fitW, setFitW] = useState(0);
  const scroller = useRef(null), ticks = useRef(null), jump = useRef(28), shift = useRef(0), grab = useRef(null), grabbedAt = useRef(0);
  const view = sliding ? win : range;

  const projects = d.projects.filter(p => !p.arch && (completed || p.status !== 'Complete') && (!client || p.client === client) && (p.start || p.end));
  const span = p => [p.start || p.end, p.end ? addDaysKey(p.end, 1) : addDaysKey(t, 3650)];
  const cols = sliding
    ? Array.from({ length: Math.round((Date.parse(view.end) - Date.parse(view.start)) / 864e5) }, (_, i) => { const k = addDaysKey(view.start, i), wd = new Date(k + 'T12:00:00').getDay(); return { key: k, top: fmt(k, { weekday: 'narrow' }), label: String(+k.slice(8)), today: k === t, shade: wd === 0 || wd === 6, month: k.slice(8) === '01' || i === 0 ? fmt(k, { month: 'short' }) : '' }; })
    : Array.from({ length: 12 }, (_, i) => { const k = `${range.start.slice(0, 4)}-${String(i + 1).padStart(2, '0')}-01`; return { key: k, label: fmt(k, { month: compact ? 'short' : 'narrow' }), today: t.slice(0, 7) === k.slice(0, 7), shade: i % 2 === 1 }; });
  const trackW = col ? cols.length * col : fitW;

  // Bars are placed in pixels. A bar too short for its name gets the name beside it, and lanes leave room for that label.
  const rows = [];
  for (const c of [...d.clients.filter(c => !c.arch), { id: '', name: 'No client' }]) {
    const placed = projects.filter(p => (p.client || '') === c.id).map(p => {
      const [s, e] = span(p), f = rangeFraction(s, e, view); if (!f) return null;
      const left = f.left * trackW + 2, w = Math.max(f.width * trackW - 4, 14), need = p.name.length * CHAR + 26, inside = w >= need;
      let from = left, to = left + w, label = null;
      if (!inside) {
        const lw = Math.min(p.name.length * CHAR + 6, 200);
        const room = trackW - (left + w + 6); // prefer the right side, shortened if needed; the left side can hide under the names
        label = room >= Math.min(lw, 70) ? { left: left + w + 6, w: Math.min(lw, room) } : { left: Math.max(0, left - 6 - lw), w: lw, flip: true };
        from = Math.min(from, label.left); to = Math.max(to, label.left + lw);
      }
      return { p, f, left, w, inside, meta: w >= need + 120, label, from, to, ongoing: !p.end };
    }).filter(Boolean).sort((a, b) => a.from - b.from);
    if (!placed.length) continue;
    const ends = [];
    for (const b of placed) { let lane = ends.findIndex(x => x <= b.from - 4); if (lane < 0) { lane = ends.length; ends.push(0); } ends[lane] = b.to; b.lane = lane; }
    rows.push({ c, bars: placed, lanes: ends.length });
  }
  const count = projects.filter(p => { const [s, e] = span(p); return rangeFraction(s, e, range); }).length, undated = d.projects.filter(p => !p.arch && p.status === 'Active' && !p.start && !p.end).length;
  const now = rangeFraction(t, addDaysKey(t, 1), view), has = rows.length > 0;

  // A new period (zoom, arrows, Today): rebuild the strip around it with its first day at the left.
  useLayoutEffect(() => { if (sliding) { jump.current = 28; setWin(around()); setMid(range.start); } }, [range.start, sliding]);
  useLayoutEffect(() => {
    const el = scroller.current; if (!el || !sliding) return;
    if (jump.current != null) { el.scrollLeft = jump.current * col; jump.current = null; el.style.setProperty('--sx', el.scrollLeft + 'px'); }
    else if (shift.current) { el.scrollLeft += shift.current; shift.current = 0; }
  }, [win, has, col]);
  // Phones scroll the year: start with this month in view.
  useLayoutEffect(() => { const el = scroller.current; if (el && !sliding && col) el.scrollLeft = range.start.slice(0, 4) === t.slice(0, 4) ? Math.max(0, (+t.slice(5, 7) - 2) * col) : 0; }, [range.start, sliding, col, has]);
  useEffect(() => {
    const el = ticks.current; if (!el || col) return;
    const ro = new ResizeObserver(([entry]) => setFitW(entry.contentRect.width)); ro.observe(el); return () => ro.disconnect();
  }, [col, has]);

  const onScroll = () => {
    const el = scroller.current; if (!el) return;
    el.style.setProperty('--sx', el.scrollLeft + 'px');
    if (!sliding) return;
    const nameW = el.querySelector('.cv-wt-name')?.offsetWidth || 0, at = addDaysKey(win.start, Math.max(0, Math.floor((el.scrollLeft + (el.clientWidth - nameW) / 2) / col)));
    if (at.slice(0, 7) !== mid.slice(0, 7)) setMid(at);
    if (shift.current || jump.current != null) return;
    if (el.scrollLeft < EDGE_PX) { shift.current = SLIDE_DAYS * col; setWin(w => ({ ...w, start: addDaysKey(w.start, -SLIDE_DAYS) })); }
    else if (el.scrollLeft + el.clientWidth > el.scrollWidth - EDGE_PX) setWin(w => ({ ...w, end: addDaysKey(w.end, SLIDE_DAYS) }));
  };
  // Mouse: grab anywhere on the strip and drag it sideways. Touch and trackpads scroll natively.
  const release = () => { grab.current = null; scroller.current?.classList.remove('is-grabbing'); };
  const pointer = col ? {
    onPointerDown: e => { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('.cv-wt-name')) return; grab.current = { x: e.clientX, left: scroller.current.scrollLeft, moved: false, id: e.pointerId }; },
    onPointerMove: e => {
      const g = grab.current; if (!g) return;
      const dx = e.clientX - g.x;
      if (!g.moved && Math.abs(dx) > 4) { g.moved = true; scroller.current.classList.add('is-grabbing'); try { scroller.current.setPointerCapture(g.id); } catch { /* already released */ } }
      if (g.moved) scroller.current.scrollLeft = g.left - dx;
    },
    onPointerUp: () => { if (grab.current?.moved) grabbedAt.current = performance.now(); release(); },
    onPointerCancel: release,
    onClickCapture: e => { if (performance.now() - grabbedAt.current < 250) { e.preventDefault(); e.stopPropagation(); } },
  } : {};
  const nudge = days => scroller.current?.scrollBy({ left: days * col, behavior: 'smooth' });
  const goTo = k => { const el = scroller.current; if (el) el.scrollTo({ left: Math.max(0, (Math.round((Date.parse(k) - Date.parse(win.start)) / 864e5) - 2) * col), behavior: 'smooth' }); };

  const dates = p => `${p.start ? fmt(p.start, { day: 'numeric', month: 'short' }) : '?'} to ${p.end ? fmt(p.end, { day: 'numeric', month: 'short' }) : 'ongoing'}`;
  const progress = p => { const all = d.tasks.filter(x => x.project === p.id && !x.arch); return all.length ? `${all.filter(x => x.status === 'Done').length}/${all.length} tasks` : ''; };
  const about = p => [p.name, dates(p), progress(p)].filter(Boolean);
  const colsStyle = { gridTemplateColumns: col ? `repeat(${cols.length}, ${col}px)` : `repeat(${cols.length}, minmax(0, 1fr))` };
  const rowStyle = { gridTemplateColumns: col ? `var(--wt-name) ${trackW}px` : 'var(--wt-name) minmax(0, 1fr)' };
  return <details className="cv-timeline" open={!compact}>
    <summary><span><b>What you’re working on</b><small>{count} project{count === 1 ? '' : 's'} this {period}{undated ? ` · ${undated} active without dates` : ''}</small></span><Icon name="chevronDown" size={18} /></summary>
    {has && sliding && <div className="cv-wt-nav"><b aria-live="polite">{fmt(mid, { month: 'long', year: 'numeric' })}</b>
      <button type="button" className="cv-icon" aria-label="Earlier dates" onClick={() => nudge(-7)}><Icon name="left" size={18} /></button>
      <button type="button" className="cv-pill" onClick={() => goTo(t)}>Today</button>
      <button type="button" className="cv-icon" aria-label="Later dates" onClick={() => nudge(7)}><Icon name="arrow" size={18} /></button></div>}
    {has ? <div ref={scroller} className={'cv-hscroll' + (col ? ' is-scroll' : '')} onScroll={onScroll} {...pointer} tabIndex={col ? 0 : undefined} aria-label={col ? 'Project timeline. Scroll sideways for more dates.' : undefined}>
      <div className="cv-wt">
        <div className="cv-wt-row cv-wt-ticks" style={rowStyle}><span className="cv-wt-name" /><div ref={ticks} className="cv-wt-cols" style={colsStyle}>{cols.map(c => <button key={c.key} type="button" tabIndex={-1} className={(c.today ? 'is-today ' : '') + (c.shade ? 'shade' : '')} onClick={() => onPickDay(c.key)} aria-label={'Open ' + fmt(c.key, { dateStyle: 'full' })}>
          {sliding && <em>{c.month}</em>}{c.top && <small>{c.top}</small>}<b>{c.label}</b></button>)}</div></div>
        {rows.map(({ c, bars, lanes }) => <div className="cv-wt-row" key={c.id || 'none'} style={rowStyle}>
          <a className="cv-wt-name" href={c.id ? '#/clients/' + c.id : '#/projects'}><i style={{ background: toneOf(c.id) || 'var(--mu)' }} /><span>{c.name}</span></a>
          <div className="cv-wt-track" style={{ height: lanes * LANE + 6, '--tone': toneOf(c.id) || 'var(--card)', '--tone-ink': toneOf(c.id) ? '#141414' : 'var(--tx)' }}>
            <div className="cv-wt-cols" style={colsStyle} aria-hidden="true">{cols.map(x => <span key={x.key} className={(x.shade ? 'shade ' : '') + (x.today ? 'is-today' : '')} />)}</div>
            {now && <span className="cv-wt-now" aria-hidden="true" style={{ left: (now.left + now.width / 2) * trackW }} />}
            {bars.map(b => <button key={b.p.id} type="button" className={'cv-wt-bar' + (b.f.before ? ' cut-l' : '') + (b.f.after || b.ongoing ? ' cut-r' : '')} style={{ left: b.left, width: b.w, top: 4 + b.lane * LANE, '--l': b.left + 'px' }}
              onClick={() => onOpen('project-' + b.p.id)} title={about(b.p).join(' · ')} aria-label={about(b.p).join(', ')}>
              {b.inside && <b>{b.p.name}</b>}{b.meta && <small>{about(b.p).slice(1).join(' · ')}</small>}</button>)}
            {bars.filter(b => b.label).map(b => <span key={b.p.id + '-l'} className={'cv-wt-label' + (b.label.flip ? ' flip' : '')} aria-hidden="true" style={{ left: b.label.left, width: b.label.w, top: 4 + b.lane * LANE }}>{b.p.name}</span>)}
          </div>
        </div>)}
      </div>
    </div> : <p className="cv-empty">No dated projects this {period}. Give a project a start date to see it here.</p>}
  </details>;
}
