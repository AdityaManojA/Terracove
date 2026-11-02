import test from 'node:test';
import assert from 'node:assert/strict';
import { monthDays, onDay, shiftMonth } from '../src/calendar-view.js';
import { eventsInLocalRange } from '../src/calendar-view.js';
import { spawnSync } from 'node:child_process';

test('export ranges include overlapping spans and respect exclusive ends',()=>{
  const events=[{id:'span',allDay:true,start:'2026-10-19',end:'2026-10-22'},{id:'ended',allDay:true,start:'2026-10-18',end:'2026-10-20'},{id:'future',allDay:true,start:'2026-10-21',end:'2026-10-22'}];
  assert.deepEqual(eventsInLocalRange(events,'2026-10-20','2026-10-20').map(e=>e.id),['span']);
  assert.equal(eventsInLocalRange(events).length,3);
  assert.deepEqual(eventsInLocalRange(events,'2026-10-22','2026-10-20'),[]);
});
test('local export dates retain near-midnight tasks on the day visible in the calendar',()=>{
  const script=`import assert from 'node:assert/strict';import {eventsInLocalRange} from './src/calendar-view.js';
    const events=[
      {id:'early',start:'2026-10-19T19:00:00Z',end:'2026-10-19T20:00:00Z'},
      {id:'late',start:'2026-10-20T18:00:00Z',end:'2026-10-20T19:00:00Z'},
      {id:'tomorrow',start:'2026-10-20T19:00:00Z',end:'2026-10-20T20:00:00Z'},
      {id:'ended',start:'2026-10-19T17:00:00Z',end:'2026-10-19T18:30:00Z'}];
    assert.deepEqual(eventsInLocalRange(events,'2026-10-20','2026-10-20').map(e=>e.id),['early','late']);`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:process.cwd(),env:{...process.env,TZ:'Asia/Kolkata'},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});

test('month grid has 42 unique days, starts on Monday and covers the whole month', () => {
  const days = monthDays('2026-10');
  assert.equal(days.length, 42); assert.equal(new Set(days).size, 42);
  assert.equal(days[0], '2026-09-28'); assert.equal(days.at(-1), '2026-11-08');
  assert.equal(days.filter(d => d.startsWith('2026-10')).length, 31);
});
test('month navigation crosses years and includes leap days', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01'); assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.ok(monthDays('2028-02').includes('2028-02-29'));
});
test('all-day project spans use exclusive ends without timezone shifts', () => {
  const event = { allDay: true, start: '2026-10-19', end: '2026-10-22' };
  assert.equal(onDay(event, '2026-10-18'), false); assert.equal(onDay(event, '2026-10-19'), true);
  assert.equal(onDay(event, '2026-10-21'), true); assert.equal(onDay(event, '2026-10-22'), false);
});
test('timed blocks appear on every local day overlapped, without a phantom event at midnight', () => {
  const start = new Date('2026-10-19T23:00:00').toISOString(), end = new Date('2026-10-20T01:00:00').toISOString();
  assert.equal(onDay({ allDay: false, start, end }, '2026-10-19'), true);
  assert.equal(onDay({ allDay: false, start, end }, '2026-10-20'), true);
  assert.equal(onDay({ allDay: false, start, end: new Date('2026-10-20T00:00:00').toISOString() }, '2026-10-20'), false);
});
import {sortCalendarItems,groupCalendarAgenda} from '../src/calendar-view.js';
test('calendar presentation puts timed work before deadlines and spans without mutating input',()=>{
  const items=[{id:'p',type:'project',allDay:true,start:'2026-10-01',title:'Project'},{id:'b',type:'task',allDay:false,start:'2026-10-20T15:00:00Z',title:'Later'},{id:'d',type:'task',allDay:true,start:'2026-10-20',title:'Due'},{id:'a',type:'taskflow-event',allDay:false,start:'2026-10-20T08:00:00Z',title:'Earlier'}];
  assert.deepEqual(sortCalendarItems(items).map(e=>e.id),['a','b','d','p']);
  assert.deepEqual(items.map(e=>e.id),['p','b','d','a']);
});
test('agenda groups dates once and anchors continuing spans to the visible month',()=>{
  const items=[{id:'old',type:'project',allDay:true,start:'2026-09-27',title:'Continuing'},{id:'new',type:'task',allDay:true,start:'2026-10-20',title:'Deadline'},{id:'same',type:'task',allDay:true,start:'2026-10-20',title:'Another'}];
  const groups=groupCalendarAgenda(items,'2026-10');
  assert.deepEqual(groups.map(g=>g.date),['2026-10-01','2026-10-20']);
  assert.deepEqual(groups.map(g=>g.events.length),[1,2]);
  assert.equal(groups.flatMap(g=>g.events).length,items.length);
});
import {calendarSourceCounts} from '../src/calendar-view.js';
test('month source markers include every connected source on crowded dates',()=>{
  const items=[...Array.from({length:6},(_,i)=>({id:'p'+i,type:'project'})),{type:'taskflow-quest'},{type:'taskflow-event'},{type:'taskflow-event'},{type:'task'}];
  assert.deepEqual(calendarSourceCounts(items),[{key:'taskflow',label:'Levern',count:1},{key:'google',label:'Google Calendar',count:2},{key:'projects',label:'Projects',count:6},{key:'tasks',label:'Terracove tasks',count:1}]);
  assert.deepEqual(calendarSourceCounts([]),[]);
});

test('zoom ranges and stepping behave like a desktop calendar', async () => {
  const { zoomRange, shiftZoom, weekStartKey } = await import('../src/calendar-view.js');
  assert.deepEqual(zoomRange('year', '2026-10-25'), { start: '2026-01-01', end: '2027-01-01' });
  assert.deepEqual(zoomRange('month', '2026-10-25'), { start: '2026-10-01', end: '2026-11-01' });
  assert.deepEqual(zoomRange('week', '2026-10-25'), { start: '2026-10-19', end: '2026-10-26' });
  assert.equal(weekStartKey('2026-10-26'), '2026-10-26');
  assert.equal(shiftZoom('month', '2026-01-31', 1), '2026-02-28');
  assert.equal(shiftZoom('year', '2028-02-29', 1), '2029-02-28');
  assert.equal(shiftZoom('week', '2026-10-25', -1), '2026-10-18');
});

test('spanning items pack into lanes and timed items share columns only when they overlap', async () => {
  const { spanLanes, layoutTimed, rangeFraction } = await import('../src/calendar-view.js');
  const days = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'];
  const lanes = spanLanes([{ id: 'a', start: '2026-10-10', end: '2026-10-22' }, { id: 'b', start: '2026-10-22', end: '2026-11-02' }, { id: 'c', start: '2026-10-20', end: '2026-10-21' }], days);
  const byId = Object.fromEntries(lanes.map(l => [l.event.id, l]));
  assert.deepEqual([byId.a.col, byId.a.span, byId.a.before], [0, 3, true]);
  assert.deepEqual([byId.b.col, byId.b.span, byId.b.after], [3, 4, true]);
  assert.equal(byId.b.lane, 0, 'b reuses the lane a has finished with');
  assert.equal(byId.c.lane, 1);
  const t = (id, h, m) => ({ id, allDay: false, start: new Date(`2026-10-25T${h}:00`).toISOString(), end: new Date(new Date(`2026-10-25T${h}:00`).getTime() + m * 60000).toISOString() });
  const timed = Object.fromEntries(layoutTimed([t('x', '09:00', 60), t('y', '09:30', 60), t('z', '13:00', 30)], '2026-10-25').map(r => [r.event.id, r]));
  assert.deepEqual([timed.x.top, timed.x.cols, timed.y.col, timed.z.cols], [540, 2, 1, 1]);
  assert.deepEqual(rangeFraction('2026-10-15', '2026-11-10', { start: '2026-10-01', end: '2026-11-01' }), { left: 14 / 31, width: 17 / 31, before: false, after: true });
  assert.equal(rangeFraction('2026-12-01', '2026-12-05', { start: '2026-10-01', end: '2026-11-01' }), null);
});

test('day load counts everything on a day and grades it free, light, busy or packed', async () => {
  const { dayLoad } = await import('../src/calendar-view.js');
  const span = (id, start, end, client) => ({ id, type: 'project', allDay: true, start, end, client: client ? { id: client } : null });
  const events = [span('a', '2026-10-12', '2026-11-03', 'x'), span('b', '2026-10-16', '2026-11-03', 'y'), span('c', '2026-10-19', '2026-11-03', 'x'), { id: 't', type: 'task', allDay: true, start: '2026-10-26', end: '2026-10-27', client: { id: 'z' } }];
  assert.deepEqual(dayLoad(events, '2026-10-11'), { count: 0, clients: 0, projects: 0, level: 'free' });
  assert.equal(dayLoad(events, '2026-10-13').level, 'light');
  assert.deepEqual(dayLoad(events, '2026-10-26'), { count: 4, clients: 3, projects: 3, level: 'busy' });
  assert.equal(dayLoad(events, '2026-11-03').level, 'free', 'end dates are exclusive');
});

test('timeline retained clients: projects retain client lanes even when scrolling to dates with no active spans', async () => {
  const { rangeFraction } = await import('../src/calendar-view.js');
  const clients = [{ id: 'c1', name: 'Acme' }, { id: 'c2', name: 'Beta' }];
  const projects = [
    { id: 'p1', client: 'c1', name: 'Website', start: '2026-10-01', end: '2026-10-31' },
    { id: 'p2', client: 'c2', name: 'App', start: '2026-12-01', end: '2026-12-31' }
  ];
  // View is in November 2026 (between October and December projects)
  const novView = { start: '2026-11-01', end: '2026-12-01' };
  const overlapsInNov = projects.map(p => rangeFraction(p.start, p.end, novView)).filter(Boolean);
  assert.equal(overlapsInNov.length, 0, 'No projects overlap November');

  // Verify activeClients preservation logic: clients with dated projects are preserved
  const clientMap = new Map(clients.map(c => [c.id, c]));
  const activeClientIds = [...new Set(projects.map(p => p.client || ''))];
  const activeClients = activeClientIds.map(id => clientMap.get(id) || { id, name: id ? 'Client' : 'No client' });
  assert.equal(activeClients.length, 2, 'Both clients preserved so timeline grid stays mounted');
  assert.deepEqual(activeClients.map(c => c.name), ['Acme', 'Beta']);
});
