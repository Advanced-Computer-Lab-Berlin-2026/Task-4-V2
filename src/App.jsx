import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-service-hours-v1';

const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description: 'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
      { year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa'] },
      { year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy'] },
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description: 'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
      { year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman'] },
      { year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam'] },
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description: 'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
      { year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel'] },
      { year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham'] },
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description: 'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
      { year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad'] },
      { year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid'] },
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description: 'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
      { year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany'] },
      { year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil'] },
    ],
  },
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

const getProgram = code => PROGRAMS[code?.toUpperCase()] || {
  name: 'Program details not yet added',
  partner: 'Partner information not yet available',
  description: 'This program does not have a profile in the example directory yet. You can still log hours for it.',
  history: [],
};
const readRoute = () => {
  const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).toUpperCase();
  } catch {
    return match[1].toUpperCase();
  }
};
function loadEntries() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(stored) ? stored : seed;
  } catch {
    return seed;
  }
}
const meanHours = entries => entries.length
  ? (entries.reduce((total, entry) => total + Number(entry.hours), 0) / entries.length).toFixed(1)
  : '—';
const sumHours = entries => entries.reduce((total, entry) => total + Number(entry.hours), 0);
const pips = hours => '●'.repeat(hours) + '○'.repeat(Math.max(0, 8 - hours));
const formatDate = date => {
  if (!date) return 'Date unavailable';
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(parsed);
};

function Kpi({ label, value, hint }) {
  return <article className="kpi"><span>{label}</span><b>{value}</b><i>{hint}</i></article>;
}

function EffortMeter({ hours }) {
  return <span className="effort-meter" aria-label={`${hours} ${hours === 1 ? 'hour' : 'hours'}`} title={`${hours} ${hours === 1 ? 'hour' : 'hours'}`}>
    <span className="pips" aria-hidden="true">{pips(hours)}</span><b>{hours}h</b>
  </span>;
}

function EntryCard({ entry, onOpenProgram, onEdit }) {
  const program = getProgram(entry.programCode);
  return (
    <article className="entry-card">
      <div className="entry-top">
        <button className="code-pill" onClick={() => onOpenProgram(entry.programCode)} title={`View ${program.name}`}>{entry.programCode}</button>
        <EffortMeter hours={entry.hours} />
      </div>
      <h3>{program.name}</h3>
      <p className="entry-note">{entry.reflection || 'No reflection shared.'}</p>
      <footer>
        <span>{entry.name} <i aria-hidden="true">·</i> {formatDate(entry.date)}</span>
        {entry.owner === 'you' && <button className="text-action" onClick={() => onEdit(entry)}>Edit your log</button>}
      </footer>
    </article>
  );
}

function ProgramCard({ code, entries, ownEntry, onOpen, onLog }) {
  const program = getProgram(code);
  const feedback = entries.find(entry => entry.reflection);
  return (
    <article className="program-card">
      <div className="program-card-top">
        <span className="tag">{code}</span>
        <span className="program-count">{entries.length} {entries.length === 1 ? 'log' : 'logs'}</span>
      </div>
      <button className="program-title" onClick={() => onOpen(code)}>{program.name}<span aria-hidden="true">↗</span></button>
      <p className="partner">{program.partner}</p>
      <p className="program-description">{program.description}</p>
      <div className="program-metrics">
        <div><b>{meanHours(entries)}<small>{entries.length ? 'h' : ''}</small></b><span>average per visit</span></div>
        <div><b>{sumHours(entries)}<small>h</small></b><span>hours shared</span></div>
      </div>
      <blockquote>
        {feedback ? <><p>“{feedback.reflection}”</p><cite>{feedback.name} · {feedback.hours} {feedback.hours === 1 ? 'hour' : 'hours'}</cite></> : <p>Be the first to share what volunteering here is like.</p>}
      </blockquote>
      <div className="program-card-actions">
        <button className="text-action" onClick={() => onOpen(code)}>See program &amp; stories <span aria-hidden="true">→</span></button>
        {ownEntry
          ? <button className="secondary-action" onClick={() => onLog(code)}>Edit your hours</button>
          : <button className="secondary-action" onClick={() => onLog(code)}>Log hours</button>}
      </div>
    </article>
  );
}

export default function App() {
  const [entries, setEntries] = useState(loadEntries);
  const [query, setQuery] = useState('');
  const [effort, setEffort] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [lookup, setLookup] = useState('ENV110');
  const [drawer, setDrawer] = useState(null);
  const [problem, setProblem] = useState('');
  const [toast, setToast] = useState('');
  const [view, setView] = useState('Dashboard');
  const [programCode, setProgramCode] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => {
      setProgramCode(readRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const openProgram = code => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    window.location.hash = `#/programs/${encodeURIComponent(normalized)}`;
    setProgramCode(normalized);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const goHome = (section = 'top') => {
    if (window.location.hash !== '#/') window.location.hash = '#/';
    setProgramCode(null);
    requestAnimationFrame(() => {
      if (section === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const navigate = (nextView, section, filterMine = false) => {
    setView(nextView);
    setQuery('');
    setEffort('all');
    setMineOnly(filterMine);
    goHome(section);
  };

  const shown = useMemo(() => entries.filter(entry => {
    const matchesQuery = `${entry.programCode} ${entry.reflection} ${entry.name} ${getProgram(entry.programCode).name}`
      .toLowerCase().includes(query.toLowerCase());
    const matchesEffort = effort === 'all' || Number(entry.hours) === Number(effort);
    return (!mineOnly || entry.owner === 'you') && matchesQuery && matchesEffort;
  }), [entries, query, effort, mineOnly]);

  const looked = entries.filter(entry => entry.programCode.toUpperCase() === lookup.trim().toUpperCase());
  const programsLogged = new Set(entries.map(entry => entry.programCode.toUpperCase()));
  const spread = [1, 2, 3, 4, 5, 6, 7, 8].map(hours => ({
    hours,
    count: entries.filter(entry => Number(entry.hours) === hours).length,
  }));
  const peak = Math.max(...spread.map(item => item.count), 1);
  const programEntries = programCode
    ? entries.filter(entry => entry.programCode.toUpperCase() === programCode)
    : [];
  const ownProgramEntry = programEntries.find(entry => entry.owner === 'you');

  function openDrawer(entry = null, code = '') {
    setProblem('');
    setDrawer({
      id: entry?.id || null,
      programCode: entry?.programCode || code,
      hours: entry ? String(entry.hours) : '',
      reflection: entry?.reflection || '',
    });
  }

  function saveEntry(event) {
    event.preventDefault();
    const normalizedCode = drawer.programCode.trim().toUpperCase();
    if (!normalizedCode) {
      setProblem('Enter a program code to continue.');
      return;
    }
    if (!/^[1-8]$/.test(drawer.hours.trim())) {
      setProblem('Enter a whole number of hours from 1 to 8.');
      return;
    }
    const duplicate = entries.some(entry =>
      entry.id !== drawer.id
      && entry.owner === 'you'
      && entry.programCode.toUpperCase() === normalizedCode,
    );
    if (duplicate) {
      setProblem(`You already have a log for ${normalizedCode}. Edit your existing entry instead.`);
      return;
    }
    const data = {
      programCode: normalizedCode,
      hours: Number(drawer.hours),
      reflection: drawer.reflection.trim(),
      name: 'You',
      owner: 'you',
      date: new Date().toISOString().slice(0, 10),
    };
    if (drawer.id) {
      setEntries(current => current.map(entry => entry.id === drawer.id ? { ...entry, ...data } : entry));
      setToast('Your hours have been updated.');
    } else {
      setEntries(current => [{ ...data, id: `e-${Date.now()}` }, ...current]);
      setToast('Your hours have been logged.');
    }
    setDrawer(null);
  }

  function resetAll() {
    setEntries(seed);
    setQuery('');
    setEffort('all');
    setMineOnly(false);
    setLookup('ENV110');
    setDrawer(null);
    setToast('Example data restored.');
  }

  const navItems = [
    { label: 'Dashboard', action: () => navigate('Dashboard', 'top') },
    { label: 'Programs', action: () => navigate('Programs', 'programs') },
    { label: 'Entries', action: () => navigate('Entries', 'entries') },
    { label: 'My hours', action: () => navigate('My hours', 'entries', true) },
  ];

  return (
    <div className="hub">
      <nav className="topbar" aria-label="Main navigation">
        <button className="brand" onClick={() => navigate('Dashboard', 'top')} aria-label="Service Hub home">
          <span className="brand-mark" aria-hidden="true">✳</span> service<span>hub</span>
        </button>
        <div className="tabs">
          {navItems.map(item => (
            <button key={item.label} className={view === item.label && !programCode ? 'on' : ''} onClick={item.action}>
              {item.label}
            </button>
          ))}
        </div>
        <button className="nav-log" onClick={() => openDrawer()}>+ Log hours</button>
        <span className="avatar" aria-label="Signed in as You">Y</span>
      </nav>

      <main className="page">
        {toast && <div className="toast" role="status"><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss notification">×</button></div>}
        {programCode ? (
          <section className="program-page">
            <button className="crumb" onClick={() => goHome('programs')}>← Back to programs</button>
            <header className="program-hero">
              <div className="program-hero-text">
                <span className="tag">{programCode}</span>
                <p className="eyebrow">COMMUNITY SERVICE PROGRAM</p>
                <h1>{getProgram(programCode).name}</h1>
                <p className="hero-partner">{getProgram(programCode).partner}</p>
              </div>
              <div className="hero-action">
                {ownProgramEntry
                  ? <button className="primary light" onClick={() => openDrawer(ownProgramEntry)}>Edit your hours</button>
                  : <button className="primary light" onClick={() => openDrawer(null, programCode)}>Log your hours</button>}
                <span>{ownProgramEntry ? 'You have already logged this program' : 'One entry per program'}</span>
              </div>
            </header>

            <div className="program-summary">
              <div><b>{meanHours(programEntries)}<small>{programEntries.length ? ' h' : ''}</small></b><span>average per volunteer</span></div>
              <div><b>{programEntries.length}</b><span>volunteer {programEntries.length === 1 ? 'story' : 'stories'}</span></div>
              <div><b>{sumHours(programEntries)}<small> h</small></b><span>time contributed</span></div>
            </div>

            <section className="detail-section" id="about">
              <div className="section-heading"><span>01</span><div><p className="eyebrow">GET TO KNOW IT</p><h2>About the program</h2></div></div>
              <div className="about-panel">
                <p>{getProgram(programCode).description}</p>
                <div><span>Community partner</span><b>{getProgram(programCode).partner}</b></div>
              </div>
            </section>

            <section className="detail-section" id="team">
              <div className="section-heading"><span>02</span><div><p className="eyebrow">PEOPLE BEHIND THE PROGRAM</p><h2>Meet the team</h2></div></div>
              {getProgram(programCode).history.length ? (
                <div className="team-grid">
                  {getProgram(programCode).history.map(year => (
                    <article className="team-year" key={year.year}>
                      <h3>{year.year}</h3>
                      <span className="label">Faculty supervisors</span><p>{year.supervisors.join(', ')}</p>
                      <span className="label">Student coordinators</span><p>{year.coordinators.join(', ')}</p>
                    </article>
                  ))}
                </div>
              ) : <p className="empty-panel">Team details for this program have not been added yet.</p>}
              <p className="fine-print">Program and staff information is fictional sample data.</p>
            </section>

            <section className="detail-section" id="stories">
              <div className="section-heading section-heading-inline">
                <span>03</span>
                <div><p className="eyebrow">FIRST-HAND EXPERIENCES</p><h2>Volunteer stories</h2></div>
                <span className="section-count">{programEntries.length} {programEntries.length === 1 ? 'entry' : 'entries'}</span>
              </div>
              {programEntries.length ? (
                <div className="story-list">
                  {programEntries.map(entry => (
                    <article className="story-card" key={entry.id}>
                      <div className="story-effort"><EffortMeter hours={entry.hours}/></div>
                      <div className="story-content">
                        <p>{entry.reflection ? `“${entry.reflection}”` : 'No reflection shared for this entry.'}</p>
                        <span>{entry.name} <i aria-hidden="true">·</i> {formatDate(entry.date)}</span>
                      </div>
                      {entry.owner === 'you' && <button className="text-action" onClick={() => openDrawer(entry)}>Edit</button>}
                    </article>
                  ))}
                </div>
              ) : <p className="empty-panel">No hours have been logged for this program yet. You could be the first.</p>}
            </section>
          </section>
        ) : (
          <>
            <header className="welcome" id="top">
              <div>
                <p className="eyebrow">SERVICE HOURS HUB <span>·</span> YOUR COMMUNITY, YOUR IMPACT</p>
                <h1>Find a way to give back.</h1>
                <p className="welcome-copy">Explore student-led programs, get a feel for the time they take, and learn from volunteers who have been there.</p>
              </div>
              <div className="welcome-actions">
                <button className="secondary-action" onClick={() => navigate('Programs', 'programs')}>Explore programs <span aria-hidden="true">↓</span></button>
              </div>
            </header>

            <section className="discovery-section" id="programs">
              <div className="section-title-row">
                <div><p className="eyebrow">FIND YOUR FIT</p><h2>Explore programs</h2></div>
                <p>See what volunteers do, how long it takes, and what they think.</p>
              </div>
              <div className="program-grid">
                {Object.keys(PROGRAMS).map(code => {
                  const activity = entries.filter(entry => entry.programCode.toUpperCase() === code);
                  return <ProgramCard
                    key={code}
                    code={code}
                    entries={activity}
                    ownEntry={activity.find(entry => entry.owner === 'you')}
                    onOpen={openProgram}
                    onLog={program => {
                      const ownEntry = entries.find(entry => entry.owner === 'you' && entry.programCode.toUpperCase() === program);
                      openDrawer(ownEntry || null, program);
                    }}
                  />;
                })}
              </div>
            </section>

            <section className="overview-section" id="overview">
              <div className="section-title-row">
                <div><p className="eyebrow">THE BIG PICTURE</p><h2>Community impact</h2></div>
                <button className="reset-button" onClick={resetAll}>Restore example data</button>
              </div>
              <div className="kpis">
                <Kpi label="Volunteer entries" value={entries.length} hint="all time"/>
                <Kpi label="Average time" value={meanHours(entries)} hint="hours per entry"/>
                <Kpi label="Active programs" value={programsLogged.size} hint="with logged hours"/>
              </div>
              <div className="dash-grid">
                <section className="card chart">
                  <div className="card-head"><div><p className="eyebrow">VOLUNTEER TIME</p><h2>Hours at a glance</h2></div><span className="muted">Entries by hours contributed</span></div>
                  <div className="chart-body">
                    <div className="ring" aria-label={`Average ${meanHours(entries)} hours per entry`}><div><b>{meanHours(entries)}</b><small>hours avg.</small></div></div>
                    <div className="columns" role="img" aria-label="Distribution of entries from one to eight hours">
                      {spread.map(item => <div className="column" key={item.hours} title={`${item.count} ${item.count === 1 ? 'entry' : 'entries'} · ${item.hours} ${item.hours === 1 ? 'hour' : 'hours'}`}>
                        <span className="column-count">{item.count}</span>
                        <div className="column-track"><i style={{ height: `${item.count / peak * 100}%` }}/></div>
                        <small>{item.hours}h</small>
                      </div>)}
                    </div>
                  </div>
                </section>
                <section className="card lookup">
                  <div className="card-head"><div><p className="eyebrow">QUICK LOOKUP</p><h2>Check a program</h2></div><span className="lookup-icon" aria-hidden="true">⌕</span></div>
                  <label htmlFor="program-lookup">Program code</label>
                  <div className="lookup-control">
                    <input id="program-lookup" value={lookup} onChange={event => setLookup(event.target.value)} placeholder="e.g. ENV110"/>
                    <button className="icon-action" onClick={() => openProgram(lookup)} disabled={!lookup.trim()} aria-label="Open program details">→</button>
                  </div>
                  <div className="lookup-result">
                    <div><b>{meanHours(looked)}<small>{looked.length ? 'h' : ''}</small></b><span>average / entry</span></div>
                    <div><b>{looked.length}</b><span>entries</span></div>
                    <div><b>{sumHours(looked)}<small>h</small></b><span>total time</span></div>
                  </div>
                  <p className="lookup-note">{lookup.trim() ? `Stats update as you type. Open the ${lookup.trim().toUpperCase()} page for details and stories.` : 'Enter a program code to see its stats.'}</p>
                </section>
              </div>
            </section>

            <section className="card entries" id="entries">
              <div className="card-head">
                <div><p className="eyebrow">REAL VOLUNTEER EXPERIENCES</p><h2>{view === 'My hours' ? 'My hours' : 'All volunteer entries'}</h2></div>
                <span className="entry-total">{shown.length} of {entries.length}</span>
              </div>
              <div className="filters">
                <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={event => { setView('Entries'); setMineOnly(false); setQuery(event.target.value); }} aria-label="Search entries by program, reflection, or volunteer" placeholder="Search program, story, or volunteer"/></label>
                <label className="filter-select"><span className="sr-only">Filter by hours</span><select value={effort} onChange={event => setEffort(event.target.value)} aria-label="Filter by hours"><option value="all">Any hours</option>{[1, 2, 3, 4, 5, 6, 7, 8].map(hours => <option key={hours} value={hours}>{hours} {hours === 1 ? 'hour' : 'hours'}</option>)}</select></label>
                <button className="text-action refresh-action" onClick={() => setToast('Entries are up to date.')}>Refresh list</button>
              </div>
              <div className="entry-grid">
                {shown.map(entry => <EntryCard key={entry.id} entry={entry} onOpenProgram={openProgram} onEdit={openDrawer}/>)}
              </div>
              {shown.length === 0 && <p className="empty-panel">{mineOnly && entries.every(entry => entry.owner !== 'you') ? 'You have not logged any hours yet. Choose a program to get started.' : 'No entries match those filters. Try another search or hour range.'}</p>}
            </section>
            <footer className="page-footer"><span>Service Hub</span><span>All program and staff details are fictional sample data.</span></footer>
          </>
        )}
      </main>

      {drawer && (
        <div className="scrim" onMouseDown={event => event.target === event.currentTarget && setDrawer(null)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <div className="drawer-head">
              <div><p className="eyebrow">{drawer.id ? 'UPDATE YOUR CONTRIBUTION' : 'ADD TO YOUR COMMUNITY IMPACT'}</p><h2 id="drawer-title">{drawer.id ? 'Edit your hours' : 'Log volunteer hours'}</h2></div>
              <button onClick={() => setDrawer(null)} aria-label="Close form">×</button>
            </div>
            <form onSubmit={saveEntry} noValidate>
              <label htmlFor="entry-program">Program code <span>Required</span></label>
              <input id="entry-program" required value={drawer.programCode} onChange={event => setDrawer(current => ({ ...current, programCode: event.target.value }))} placeholder="e.g. ENV110" autoFocus aria-invalid={Boolean(problem && !drawer.programCode.trim())}/>
              <p className="field-hint">Use a code from the program cards, or enter another code.</p>
              <label htmlFor="entry-hours">Hours contributed <span>Required · whole number 1–8</span></label>
              <input id="entry-hours" type="number" min="1" max="8" step="1" inputMode="numeric" required value={drawer.hours} onChange={event => setDrawer(current => ({ ...current, hours: event.target.value }))} placeholder="e.g. 3" aria-invalid={Boolean(problem && (!drawer.hours.trim() || !/^[1-8]$/.test(drawer.hours.trim())))}/>
              <label htmlFor="entry-reflection">Your reflection <span>Optional</span></label>
              <textarea id="entry-reflection" value={drawer.reflection} rows={5} onChange={event => setDrawer(current => ({ ...current, reflection: event.target.value }))} placeholder="What did you work on? Any advice for the next volunteer?"/>
              <p className="field-hint">You can log once per program. Your reflection helps other students choose.</p>
              {problem && <div className="problem" role="alert">{problem}</div>}
              <div className="drawer-actions"><button type="submit" className="primary">Save hours</button><button type="button" className="link-btn" onClick={() => setDrawer(null)}>Cancel</button></div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
