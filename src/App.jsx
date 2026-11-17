import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-service-hours-v1';

// Fictional volunteering programs for the self-contained UI/UX exercise.
// Staff names, partners and descriptions are examples, not real university records.
const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description: 'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
     { year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy'] },
     { year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa'] },
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description: 'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
     { year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam'] },
     { year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman'] },
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description: 'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
     { year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham'] },
     { year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel'] },
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description: 'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
     { year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid'] },
     { year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad'] },
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description: 'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
     { year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil'] },
     { year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany'] },
    ],
  },
};

const getProgram = code => PROGRAMS[code?.toUpperCase()] || {
 name: 'Program details not yet added',
 partner: '—',
 description: 'This program does not have a profile in the example directory.',
 history: [],
};

const readRoute = () => {
 const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
 return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};

const seed = [
 { id: 'e1', programCode: 'ENV110', hours: 3, reflection: 'Planting day was well organised and the team lead explained every step.', owner: 'you', name: 'You', date: '2026-10-11' },
 { id: 'e2', programCode: 'EDU210', hours: 2, reflection: 'If you prepare examples in advance the sessions run smoothly.', owner: 'other', name: 'Habiba', date: '2026-10-08' },
 { id: 'e3', programCode: 'HLT150', hours: 6, reflection: 'Long shift but very rewarding. Bring water and snacks.', owner: 'other', name: 'Omar', date: '2026-10-03' },
 { id: 'e4', programCode: 'COM305', hours: 4, reflection: 'Packing went quickly once roles were clear.', owner: 'you', name: 'You', date: '2026-09-29' },
 { id: 'e5', programCode: 'TEC220', hours: 2, reflection: 'Patience matters more than technical knowledge here.', owner: 'other', name: 'Lina', date: '2026-09-25' },
 { id: 'e6', programCode: 'ENV110', hours: 5, reflection: 'Recycling audit took longer than planned.', owner: 'other', name: 'Youssef', date: '2026-09-19' },
 { id: 'e7', programCode: 'EDU210', hours: 3, reflection: 'Students asked great questions about recursion.', owner: 'other', name: 'Mariam', date: '2026-09-12' },
 { id: 'e8', programCode: 'HLT150', hours: 8, reflection: '', owner: 'other', name: 'Ali', date: '2026-09-05' },
 { id: 'e9', programCode: 'COM305', hours: 1, reflection: 'Short orientation session only.', owner: 'other', name: 'Nour', date: '2026-08-28' },
 { id: 'e10', programCode: 'ENV110', hours: 2, reflection: 'Good for a first volunteering experience.', owner: 'other', name: 'Farah', date: '2026-08-20' },
];

function loadEntries() {
 try {
   const s = JSON.parse(localStorage.getItem(KEY));
   return Array.isArray(s) ? s : seed;
 } catch {
   return seed;
 }
}

const meanHours = a => a.length ? (a.reduce((s, e) => s + e.hours, 0) / a.length).toFixed(1) : '—';
const sumHours = a => a.reduce((s, e) => s + e.hours, 0);
const pips = n => '●'.repeat(n) + '○'.repeat(Math.max(0, 8 - n));

function Kpi({ label, value, hint }) {
 return (
   <div className="kpi">
     <span className="kpi-label">{label}</span>
     <b className="kpi-value">{value}</b>
     <small className="kpi-sub">{hint}</small>
   </div>
 );
}

export default function App() {
 const [entries, setEntries] = useState(loadEntries);
 const [query, setQuery] = useState('');
 const [effort, setEffort] = useState('all');
 const [lookup, setLookup] = useState('ENV110');
 const [drawer, setDrawer] = useState(null);
 const [problem, setProblem] = useState('');
 const [toast, setToast] = useState('');
 const [view, setView] = useState('Dashboard');
 const [programCode, setProgramCode] = useState(readRoute);
 const [programTab, setProgramTab] = useState('About');

 useEffect(() => {
   const onHash = () => {
     setProgramCode(readRoute());
     setProgramTab('About');
     window.scrollTo({ top: 0, behavior: 'instant' });
   };
   window.addEventListener('hashchange', onHash);
   return () => window.removeEventListener('hashchange', onHash);
 }, []);

 useEffect(() => {
   localStorage.setItem(KEY, JSON.stringify(entries));
 }, [entries]);

 const openProgram = code => {
   const safeCode = String(code || '').trim().toUpperCase();
   if (!safeCode) return;
   window.location.hash = `#/programs/${encodeURIComponent(safeCode)}`;
   setProgramCode(safeCode);
   setProgramTab('About');
   window.scrollTo({ top: 0, behavior: 'instant' });
 };

 const goHome = where => {
   window.location.hash = '#/';
   setProgramCode(null);
   if (where === 'entries') {
     setView('Entries');
     requestAnimationFrame(() => document.getElementById('entries')?.scrollIntoView({ behavior: 'smooth' }));
   } else {
     setView('Dashboard');
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }
 };

 const shown = useMemo(
   () => entries.filter(e => (effort === 'all' || e.hours === Number(effort)) && `${e.programCode} ${e.reflection} ${e.name}`.toLowerCase().includes(query.toLowerCase())),
   [entries, query, effort]
 );

 const looked = entries.filter(e => e.programCode.toUpperCase() === lookup.trim().toUpperCase());
 const programsLogged = [...new Set(entries.map(e => e.programCode))];
 const spread = [1, 2, 3, 4, 5, 6, 7, 8].map(h => ({ h, count: entries.filter(e => e.hours === h).length }));
 const peak = Math.max(...spread.map(s => s.count), 1);
 const programEntries = programCode ? entries.filter(e => e.programCode.toUpperCase() === programCode) : [];
 const programSummaries = Object.keys(PROGRAMS).map(code => {
   const programEntriesForCode = entries.filter(e => e.programCode.toUpperCase() === code);
   return {
     code,
     name: PROGRAMS[code].name,
     avg: meanHours(programEntriesForCode),
     count: programEntriesForCode.length,
   };
 });

 function openDrawer(e) {
   if (e && e.owner !== 'you') return;
   setProblem('');
   setDrawer({
     id: e?.id || null,
     programCode: e?.programCode || '',
     hours: e ? String(e.hours) : '',
     reflection: e?.reflection || '',
   });
 }

 function save(ev) {
   ev.preventDefault();
   const cleanCode = drawer.programCode.trim().toUpperCase();

   if (!cleanCode) {
     setProblem('Enter a program code before saving.');
     return;
   }

   if (!/^\d+$/.test(String(drawer.hours).trim()) || Number(drawer.hours) < 1 || Number(drawer.hours) > 8) {
     setProblem('Hours must be a whole number from 1 to 8.');
     return;
   }

   if (entries.some(e => e.id !== drawer.id && e.owner === 'you' && e.programCode.toUpperCase() === cleanCode)) {
     setProblem('You already logged hours for this program. Edit your existing entry instead.');
     return;
   }

   const data = {
     programCode: cleanCode,
     hours: Number(drawer.hours.trim()),
     reflection: drawer.reflection.trim(),
     name: 'You',
     owner: 'you',
     date: new Date().toISOString().slice(0, 10),
   };

   if (drawer.id) {
     setEntries(entries.map(e => e.id === drawer.id ? { ...e, ...data } : e));
     setToast('Entry updated.');
   } else {
     setEntries([{ ...data, id: 'e-' + Date.now() }, ...entries]);
     setToast('Hours logged.');
   }

   setDrawer(null);
   setProblem('');
 }

 function resetAll() {
   setEntries(seed);
   setQuery('');
   setEffort('all');
   setLookup('ENV110');
   setDrawer(null);
   setProblem('');
   setToast('Demo data restored.');
 }

 const navItems = [
   ['Dashboard', () => { setView('Dashboard'); goHome('top'); }],
   ['Entries', () => { setView('Entries'); goHome('entries'); }],
   ['My log', () => { setView('My log'); setQuery('You'); goHome('entries'); }],
 ];

 return (
   <div className="hub">
     <nav className="topbar">
       <button className="brand" type="button" onClick={() => goHome('top')}>
         <span className="brand-mark">◆</span>
         service<b>hub</b>
       </button>

       <div className="tabs">
         {navItems.map(([label, action]) => (
           <button
             key={label}
             type="button"
             className={`tab ${!programCode && view === label ? 'active' : ''}`}
             onClick={action}
           >
             {label}
           </button>
         ))}
       </div>

       <div className="topbar-end">
         <button type="button" className="new-link" onClick={() => openDrawer(null)}>
           + Log hours
         </button>
         <span className="avatar">Y</span>
       </div>
     </nav>

     <main className="page">
       {programCode ? (
         <section className="program-page">
           <button type="button" className="crumb" onClick={() => goHome('top')}>
             ← Back to dashboard
           </button>

           <header className="program-hero">
             <div className="program-hero-copy">
               <span className="tag">{programCode}</span>
               <h1>{getProgram(programCode).name}</h1>
               <p>{getProgram(programCode).partner}</p>
             </div>

             <div className="hero-stats">
               <div>
                 <b>{meanHours(programEntries)}</b>
                 <span>avg</span>
               </div>
               <div>
                 <b>{programEntries.length}</b>
                 <span>logs</span>
               </div>
             </div>
           </header>

           <div className="segmented">
             {['About', 'Team', 'Entries'].map(tab => (
               <button
                 key={tab}
                 type="button"
                 className={programTab === tab ? 'on' : ''}
                 onClick={() => setProgramTab(tab)}
               >
                 {tab}
               </button>
             ))}
           </div>

           {programTab === 'About' && (
             <section className="card about">
               <h2>About this program</h2>
               <p>{getProgram(programCode).description}</p>
               <dl>
                 <dt>Partner</dt>
                 <dd>{getProgram(programCode).partner}</dd>
                 <dt>Program code</dt>
                 <dd>{programCode}</dd>
               </dl>
             </section>
           )}

           {programTab === 'Team' && (
             <section className="card team-card">
               <h2>Program team</h2>
               <p className="muted">Faculty supervisors and student coordinators for the last two academic years.</p>

               {getProgram(programCode).history.length ? (
                 <div className="team-grid">
                   {getProgram(programCode).history.map(team => (
                     <div className="team-year" key={team.year}>
                       <h3>{team.year}</h3>
                       <span className="label">Supervisors</span>
                       <p>{team.supervisors.join(', ')}</p>
                       <span className="label">Student coordinators</span>
                       <p>{team.coordinators.join(', ')}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="muted">No example team records for this program.</p>
               )}

               <p className="fine-print">Illustrative program and staff records; all names are fictional.</p>
             </section>
           )}

           {programTab === 'Entries' && (
             <section className="card program-entries">
               <div className="card-head">
                 <h2>Logged hours</h2>
                 <button type="button" className="ghost" onClick={() => openDrawer(null)}>
                   + Log
                 </button>
               </div>

               {programEntries.length ? (
                 <ul className="timeline">
                   {programEntries.map(e => (
                     <li key={e.id}>
                       <div className="timeline-top">
                         <b>{e.name}</b>
                         <span className="pips" title={`${e.hours} hours`}>{pips(e.hours)}</span>
                       </div>
                       <p>{e.reflection || '—'}</p>
                       <small>
                         {e.owner === 'you' ? (
                           <>
                             This term <button type="button" className="icon-btn" title="Edit" onClick={() => openDrawer(e)}>✎</button>
                           </>
                         ) : (
                           'This term'
                         )}
                       </small>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="muted">Nothing logged yet.</p>
               )}
             </section>
           )}
         </section>
       ) : (
         <>
           <header className="welcome">
             <div className="welcome-copy">
               <p className="eyebrow">Community service dashboard</p>
               <h1>Choose a volunteering opportunity</h1>
               <p className="welcome-text">Review previous volunteer effort, compare program patterns, and log your own service hours.</p>
             </div>

             <div className="welcome-actions">
               <button type="button" className="secondary" onClick={resetAll}>Reset data</button>
               <button type="button" className="primary" onClick={() => openDrawer(null)}>+ Log hours</button>
             </div>
           </header>

           {toast && (
             <div className="toast" role="status">
               <span>{toast}</span>
               <button type="button" onClick={() => setToast('')}>×</button>
             </div>
           )}

           <section className="kpis">
             <Kpi label="Entries" value={entries.length} hint="all time" />
             <Kpi label="Avg / entry" value={meanHours(entries)} hint="hours" />
             <Kpi label="Programs" value={programsLogged.length} hint="with activity" />
           </section>

           <div className="dashboard-grid">
             <section className="card lookup-card">
               <div className="card-head">
                 <div>
                   <p className="eyebrow">Program check</p>
                   <h2>Compare a program</h2>
                 </div>
                 <button type="button" className="text-button" onClick={() => openProgram(lookup.trim())}>
                   Open details
                 </button>
               </div>

               <label className="field">
                 <span>Program code</span>
                 <input value={lookup} onChange={e => setLookup(e.target.value)} placeholder="ENV110" />
               </label>

               <div className="lookup-result">
                 <div>
                   <b>{meanHours(looked)}</b>
                   <span>avg / entry</span>
                 </div>
                 <div>
                   <b>{looked.length}</b>
                   <span>entries</span>
                 </div>
                 <div>
                   <b>{sumHours(looked)}</b>
                   <span>total hours</span>
                 </div>
               </div>

               <div className="program-mini-list">
                 {programSummaries.map(item => (
                   <button key={item.code} type="button" className="program-mini" onClick={() => openProgram(item.code)}>
                     <div>
                       <strong>{item.code}</strong>
                       <span>{item.name}</span>
                     </div>
                     <small>{item.avg}h avg</small>
                   </button>
                 ))}
               </div>
             </section>

             <section className="card entries-card" id="entries">
               <div className="card-head">
                 <div>
                   <p className="eyebrow">Activity feed</p>
                   <h2>Volunteer reflections</h2>
                 </div>
                 <span className="count-pill">{shown.length}/{entries.length}</span>
               </div>

               <div className="filters">
                 <input
                   className="filter-search"
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   aria-label="Search entries"
                   placeholder="Search program, name or reflection"
                 />
                 <select value={effort} onChange={e => setEffort(e.target.value)} aria-label="Effort filter">
                   <option value="all">Any effort</option>
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                     <option key={h} value={h}>Level {h}</option>
                   ))}
                 </select>
               </div>

               <div className="entry-grid">
                 {shown.map(e => (
                   <article className="entry-card" key={e.id}>
                     <div className="entry-top">
                       <button type="button" className="program-chip" onClick={() => openProgram(e.programCode)}>
                         {e.programCode}
                       </button>
                       <span className="pips" title={`${e.hours} hours`}>{pips(e.hours)}</span>
                     </div>

                     <p className="entry-note">{e.reflection || '—'}</p>

                     <div className="entry-meta">
                       <span>{e.name} · This term</span>
                       {e.owner === 'you' && (
                         <button type="button" className="icon-btn" title="Edit" onClick={() => openDrawer(e)}>
                           ✎
                         </button>
                       )}
                     </div>
                   </article>
                 ))}
               </div>

               {shown.length === 0 && <p className="empty">No matching entries yet.</p>}
             </section>
           </div>

           <section className="card effort-card">
             <div className="card-head">
               <div>
                 <p className="eyebrow">Overview</p>
                 <h2>Hours distribution</h2>
               </div>
               <span className="muted">1–8 hour levels</span>
             </div>

             <div className="chart-body">
               <div className="ring">
                 <div>
                   <b>{meanHours(entries)}</b>
                   <small>mean</small>
                 </div>
               </div>

               <div className="columns">
                 {spread.map(item => (
                   <div className="column" key={item.h} title={`${item.count} entries`}>
                     <div className="column-track">
                       <i style={{ height: `${(item.count / peak) * 100}%` }} />
                     </div>
                     <small>{item.h}</small>
                   </div>
                 ))}
               </div>
             </div>
           </section>
         </>
       )}
     </main>

     {drawer && (
       <div className="scrim" onMouseDown={e => e.target === e.currentTarget && setDrawer(null)}>
         <aside className="drawer" role="dialog" aria-modal="true" aria-label="Log hours">
           <div className="drawer-head">
             <h2>{drawer.id ? 'Edit entry' : 'Log hours'}</h2>
             <button type="button" onClick={() => setDrawer(null)} aria-label="Close">×</button>
           </div>

           <form onSubmit={save} className="drawer-form">
             <label className="field">
               <span>Program code</span>
               <input
                 value={drawer.programCode}
                 onChange={e => setDrawer(d => ({ ...d, programCode: e.target.value }))}
                 placeholder="ENV110"
               />
             </label>

             <label className="field">
               <span>Hours</span>
               <input
                 value={drawer.hours}
                 onChange={e => setDrawer(d => ({ ...d, hours: e.target.value }))}
                 placeholder="3"
               />
             </label>

             <label className="field">
               <span>Reflection</span>
               <textarea
                 value={drawer.reflection}
                 rows={6}
                 onChange={e => setDrawer(d => ({ ...d, reflection: e.target.value }))}
                 placeholder="What did you learn or notice?"
               />
             </label>

             {problem && (
               <div className="problem" role="alert">
                 {problem}
               </div>
             )}

             <div className="drawer-actions">
               <button type="submit" className="primary">Save</button>
               <button type="button" className="link-btn" onClick={() => setDrawer(null)}>
                 Discard
               </button>
             </div>
           </form>
         </aside>
       </div>
     )}
   </div>
 );
}
