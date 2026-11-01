// Local-only visual fixture. No Firebase calls or real accounts.
import React from 'react';
import {createRoot} from 'react-dom/client';
import Calendar from '../src/Calendar.jsx';
import {ViewStateProvider} from '../src/ViewState.jsx';
import {demoData} from '../src/demo';
import {today} from '../src/lib';
import {normalizeTaskflow} from '../src/taskflow-data';
import '../src/styles.css';
import '../src/taskflow.css';
import '../src/dark.css';
import '../src/responsive.css';
import '../src/calendar-refresh.css';
import '../src/theme.css';
import '../src/calendar.css';
const date=today(),d=demoData();
for(let i=0;i<5;i++)d.projects.push({...d.projects[0],id:'extra-'+i,name:'Example project '+i,start:date,end:date});
const data=normalizeTaskflow({tz:'Asia/Kolkata',quests:[{id:'quest-example',title:'TaskFlow - review tomorrow’s priorities',due:date,tier:2}],events:[{id:'google-example',title:'Google Calendar - design catch-up',allDay:false,start:date+'T14:00:00+05:30',end:date+'T14:30:00+05:30',url:'https://calendar.google.com/'}]});
createRoot(document.getElementById('root')).render(<ViewStateProvider owner="synthetic-qa"><main style={{paddingTop:20}}><p><strong>Synthetic QA example</strong> · Sample TaskFlow and Google events; no real account data.</p><Calendar d={d} mut={()=>{}} open={()=>{}} taskflow={{status:'ready',data,retry:()=>{}}}/></main></ViewStateProvider>);
