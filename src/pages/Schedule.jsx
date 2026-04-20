import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar, Clock, MapPin, Link2, Trash2,
  Video, Building2, Plus, ChevronLeft, ChevronRight,
  LayoutList, CalendarDays, Loader2, X,
  Navigation,
} from 'lucide-react';
import api from '../api/gateway';
import { toast } from 'vibe-toast';
import AddInterviewModal from '../components/AddInterviewModal';
import { useNavigate } from 'react-router-dom';
import { useDateFormatter } from '../utils/dateTime';

/* ════════════════════════════════════
   HELPERS
   ════════════════════════════════════ */

const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

/* relative label for a parsed Date at midnight */
const dayLabel = (parsed) => {
  if (!parsed) return null;
  const ref = new Date(parsed); ref.setHours(0, 0, 0, 0);
  const now  = new Date();      now.setHours(0, 0, 0, 0);
  const diff = Math.round((ref - now) / 86400000);
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return null;
};

/* group interviews into today / this-week / upcoming / past */
const groupInterviews = (interviews) => {
  const now     = new Date(); now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
  const groups  = { today: [], thisWeek: [], upcoming: [], past: [] };

  interviews.forEach(itv => {
    const d = safeDate(itv.date);
    if (!d) { groups.upcoming.push(itv); return; }
    const dMid = new Date(d); dMid.setHours(0, 0, 0, 0);
    const t = dMid.getTime();
    if      (t === now.getTime())     groups.today.push(itv);
    else if (t > now.getTime() && t <= weekEnd.getTime()) groups.thisWeek.push(itv);
    else if (t > weekEnd.getTime())   groups.upcoming.push(itv);
    else                              groups.past.push(itv);
  });

  const byDate = (a, b) => {
    const da = safeDate(a.date), db = safeDate(b.date);
    if (!da && !db) return 0;
    if (!da) return 1; if (!db) return -1;
    return da - db;
  };
  Object.keys(groups).forEach(k => groups[k].sort(byDate));
  return groups;
};



/* ════════════════════════════════════
   INTERVIEW ROW (List View)
   ════════════════════════════════════ */
const InterviewRow = ({ itv, onDelete }) => {
  const parsed  = safeDate(itv.date);
  const relabel = dayLabel(parsed);
  const isToday = relabel === 'Today';
  const isVideo = itv.type === 'VIDEO CALL';
  const { formatDate, formatTime } = useDateFormatter();

  const handleJoin = () => {
    const v = itv.venue || '';
    if (/^https?:\/\//i.test(v)) window.open(v, '_blank');
    else toast.info('No join link available for this interview.');
  };

  const displayDate = formatDate(itv.date) || itv.date;

  return (
    <div className="timeline-item" style={{
      background: isToday ? 'var(--ct-primary-light)' : 'var(--ct-card)',
      border: `1px solid ${isToday ? 'rgba(79,70,229,0.2)' : 'var(--ct-border)'}`,
    }}>
      {/* left color bar */}
      <div className="timeline-left-bar" style={{ background: itv.color || 'var(--ct-primary)' }} />

      {/* avatar */}
      <div className="company-avatar" style={{ background: `${itv.logoColor || itv.color || 'var(--ct-primary)'}18`, color: itv.logoColor || itv.color || 'var(--ct-primary)', fontSize: '13px' }}>
        {itv.logo || itv.company?.slice(0, 2).toUpperCase()}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ct-text)' }}>
            {itv.title} {itv.roundName && <span style={{ opacity: 0.6 }}>— {itv.roundName}</span>}
          </span>
          {relabel && (
            <span style={{
              fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.07em',
              background: isToday ? 'var(--ct-primary)' : 'var(--ct-warning-light)',
              color: isToday ? '#fff' : 'var(--ct-warning)',
            }}>
              {relabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginBottom: '9px' }}>
          {itv.company} · {itv.location}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--ct-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />{displayDate}</span>
          {itv.time && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} />{formatTime(itv.time)}</span>}
          {itv.venue && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <MapPin size={11} />{itv.venue}
            </span>
          )}
        </div>
      </div>

      {/* type badge */}
      <span className={`badge ${isVideo ? 'badge-video' : 'badge-onsite'}`} style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
        {isVideo ? <Video size={9} style={{ marginRight: '4px' }} /> : <Building2 size={9} style={{ marginRight: '4px' }} />}
        {itv.type}
      </span>

      {/* actions */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button className="icon-btn" onClick={handleJoin} title="Join / Open link">
          <Link2 size={14} />
        </button>
        <button
          className="icon-btn"
          onClick={() => onDelete(itv._id)}
          title="Delete interview"
          style={{ '--hover-color': 'var(--ct-danger)', '--hover-bg': 'var(--ct-danger-light)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ct-danger)'; e.currentTarget.style.color = 'var(--ct-danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

/* ── group section header ── */
const GroupHeader = ({ label, count, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 10px' }}>
    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color }}>{label}</span>
    <span style={{ fontSize: '11px', fontWeight: '700', background: `${color}18`, color, borderRadius: '10px', padding: '2px 8px' }}>{count}</span>
    <div style={{ flex: 1, height: '1px', background: 'var(--ct-border)' }} />
  </div>
);

/* ════════════════════════════════════
   CALENDAR VIEW
   ════════════════════════════════════ */
const CalendarView = ({ interviews }) => {
  const [viewDate,     setViewDate]     = useState(new Date());
  const [selectedDay,  setSelectedDay]  = useState(null); // { year, month, day }
  const { formatTime } = useDateFormatter();

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday   = () => { setViewDate(new Date()); setSelectedDay(null); };

  const firstDOW   = new Date(year, month, 1).getDay();       // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  /* map interviews to {day: [itv,...]} for this month/year */
  const byDay = useMemo(() => {
    const map = {};
    interviews.forEach(itv => {
      const d = safeDate(itv.date);
      if (!d) return;
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const key = d.getDate();
      if (!map[key]) map[key] = [];
      map[key].push(itv);
    });
    return map;
  }, [interviews, year, month]);

  /* interviews for the selected day */
  const selectedItvs = useMemo(() => {
    if (!selectedDay) return [];
    const key = selectedDay.day;
    return (byDay[key] || []).filter(itv => {
      const d = safeDate(itv.date);
      return d && d.getFullYear() === selectedDay.year && d.getMonth() === selectedDay.month;
    });
  }, [selectedDay, byDay]);

  const isToday = (d) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const isSelected = (d) =>
    selectedDay && selectedDay.year === year && selectedDay.month === month && selectedDay.day === d;

  /* build grid cells: nulls for empty slots, then 1..daysInMonth */
  const cells = [
    ...Array(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  /* pad to complete last row */
  while (cells.length % 7 !== 0) cells.push(null);

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="rg-sidebar-sm">

        {/* ── Calendar grid ── */}
        <div className="ct-card" style={{ padding: '22px' }}>
          {/* month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <button onClick={prevMonth} className="icon-btn"><ChevronLeft size={15} /></button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ct-text)', letterSpacing: '-0.01em' }}>
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={goToday} style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', border: '1px solid var(--ct-border)', background: 'transparent', color: 'var(--ct-primary)', fontWeight: '700', cursor: 'pointer' }}>
                Today
              </button>
              <button onClick={nextMonth} className="icon-btn"><ChevronRight size={15} /></button>
            </div>
          </div>

          {/* day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px', marginBottom: '4px' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--ct-text-muted)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const hasItvs = !!byDay[day]?.length;
              const itvCount = byDay[day]?.length || 0;
              const todayCell = isToday(day);
              const selCell   = isSelected(day);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(selCell ? null : { year, month, day })}
                  style={{
                    minHeight: '72px', borderRadius: '10px', padding: '7px 6px',
                    cursor: 'pointer', transition: 'all 0.18s',
                    background: todayCell
                      ? 'var(--ct-primary)'
                      : selCell
                        ? 'var(--ct-primary-light)'
                        : hasItvs
                          ? 'var(--ct-bg-secondary)'
                          : 'transparent',
                    border: `1.5px solid ${selCell && !todayCell ? 'var(--ct-primary)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => { if (!todayCell && !selCell) e.currentTarget.style.background = 'var(--ct-bg-secondary)'; }}
                  onMouseLeave={e => { if (!todayCell && !selCell) e.currentTarget.style.background = hasItvs ? 'var(--ct-bg-secondary)' : 'transparent'; }}
                >
                  {/* day number */}
                  <div style={{
                    fontSize: '12px', fontWeight: todayCell ? '800' : '600',
                    color: todayCell ? '#fff' : selCell ? 'var(--ct-primary)' : 'var(--ct-text)',
                    marginBottom: '4px',
                  }}>
                    {day}
                  </div>

                  {/* interview pills */}
                  {byDay[day]?.slice(0, 2).map((itv, j) => (
                    <div key={j} style={{
                      fontSize: '9px', fontWeight: '700', padding: '2px 5px', borderRadius: '5px', marginBottom: '2px',
                      background: todayCell ? 'rgba(255,255,255,0.2)' : `${itv.color || 'var(--ct-primary)'}22`,
                      color: todayCell ? '#fff' : (itv.color || 'var(--ct-primary)'),
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {itv.title}
                    </div>
                  ))}
                  {itvCount > 2 && (
                    <div style={{ fontSize: '9px', color: todayCell ? 'rgba(255,255,255,0.7)' : 'var(--ct-text-muted)', fontWeight: '600' }}>
                      +{itvCount - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Day panel ── */}
        <div className="ct-card" style={{ padding: '20px', minHeight: '300px' }}>
          {selectedDay ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ct-text)', marginBottom: '2px' }}>
                  {new Date(selectedDay.year, selectedDay.month, selectedDay.day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)' }}>
                  {selectedItvs.length} interview{selectedItvs.length !== 1 ? 's' : ''}
                </div>
              </div>

              {selectedItvs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ct-text-muted)', fontSize: '12px' }}>
                  No interviews on this day.
                </div>
              ) : (
                selectedItvs.map(itv => {
                  const isVideo = itv.type === 'VIDEO CALL';
                  return (
                    <div key={itv._id} style={{
                      padding: '12px', borderRadius: '10px', marginBottom: '10px',
                      background: 'var(--ct-bg-secondary)', border: '1px solid var(--ct-border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${itv.color || 'var(--ct-primary)'}18`, color: itv.color || 'var(--ct-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>
                          {itv.logo || itv.company?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ct-text)' }}>{itv.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)' }}>{itv.company}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--ct-text-muted)', flexWrap: 'wrap' }}>
                        {itv.time && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} />{formatTime(itv.time)}</span>}
                        <span className={`badge ${isVideo ? 'badge-video' : 'badge-onsite'}`} style={{ fontSize: '9px', padding: '1px 7px' }}>{itv.type}</span>
                      </div>
                      {itv.venue && (
                        <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--ct-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={9} />
                          {/^https?:\/\//i.test(itv.venue) ? (
                            <a href={itv.venue} target="_blank" rel="noreferrer" style={{ color: 'var(--ct-primary)', fontWeight: '600' }}>Join link</a>
                          ) : itv.venue}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', color: 'var(--ct-text-muted)', textAlign: 'center', gap: '10px' }}>
              <Calendar size={36} style={{ opacity: 0.25 }} />
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Click a day to see interviews</div>
              <div style={{ fontSize: '11px' }}>Days with interviews are highlighted</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════
   SCHEDULE PAGE
   ════════════════════════════════════ */
const Schedule = () => {
  const navigate = useNavigate();
  const { formatTime } = useDateFormatter();
  const [view,       setView]       = useState('list');
  const [interviews, setInterviews] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [showPast,   setShowPast]   = useState(false);

  const fetchInterviews = useCallback(async () => {
    try {
      const { data } = await api.get('/interviews');
      setInterviews(data);
    } catch {
      toast.error('Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this interview from your schedule?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      toast.success('Interview removed.');
      fetchInterviews();
    } catch {
      toast.error('Failed to remove interview.');
    }
  };

  /* ── derived data ── */
  const groups = useMemo(() => groupInterviews(interviews), [interviews]);

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

  const upcomingCount = interviews.filter(itv => {
    const d = safeDate(itv.date);
    return !d || d >= now;
  }).length;

  const thisWeekCount = groups.today.length + groups.thisWeek.length;

  /* next upcoming interview for the banner */
  const nextInterview = useMemo(() => {
    const all = [...groups.today, ...groups.thisWeek, ...groups.upcoming];
    return all[0] || null;
  }, [groups]);

  return (
    <div className="page-enter">

      {/* ── Top stats row ── */}
      <div className="rg-3stats" style={{ marginBottom: '26px' }}>

        {/* Upcoming count */}
        <div className="ct-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ct-text-muted)', marginBottom: '8px' }}>Upcoming</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--ct-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {loading ? '—' : String(upcomingCount).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginTop: '4px' }}>Interviews</div>
        </div>

        {/* This week count */}
        <div className="ct-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ct-text-muted)', marginBottom: '8px' }}>This Week</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--ct-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {loading ? '—' : String(thisWeekCount).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginTop: '4px' }}>Scheduled</div>
        </div>

        {/* Featured interview banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--ct-primary), var(--ct-primary-dark))',
          borderRadius: 'var(--ct-radius)', padding: '22px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'white', position: 'relative', overflow: 'hidden', gap: '16px',
        }}>
          <div style={{ position: 'absolute', width: '180px', height: '180px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', top: '-60px', right: '-40px' }} />
          <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
            {nextInterview ? (
              <>
                <div style={{ fontSize: '11px', fontWeight: '700', opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {dayLabel(safeDate(nextInterview.date)) || 'Next Up'}
                </div>
                <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextInterview.title}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>
                  {nextInterview.company}{nextInterview.time ? ` · ${formatTime(nextInterview.time)}` : ''}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '3px' }}>No upcoming interviews</div>
                <div style={{ fontSize: '12px', opacity: 0.75 }}>Plan your interviews</div>
              </>
            )}
          </div>
          <button
            onClick={() => navigate('/pipeline')}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '9px', padding: '9px 16px', color: 'white',
              fontWeight: '700', fontSize: '12px', cursor: 'pointer',
              transition: 'background 0.2s', whiteSpace: 'nowrap', position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'center', gap: '6px',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <Navigation size={14} /> Pipeline
          </button>
        </div>
      </div>

      {/* ── Timeline header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <Calendar size={18} style={{ color: 'var(--ct-primary)' }} />
          <span className="section-title">Interview Timeline</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'list',     label: 'List View',    icon: LayoutList },
            { id: 'calendar', label: 'Calendar',     icon: CalendarDays },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)}
              style={{
                padding: '7px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: view === id ? 'var(--ct-primary)' : 'var(--ct-card)',
                color:      view === id ? '#fff' : 'var(--ct-text-secondary)',
                border: `1px solid ${view === id ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
              }}>
              <Icon size={13} />{label}
            </button>
          ))}
          <button onClick={() => navigate('/pipeline')} className="btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }}>
            <Navigation size={13} /> Pipeline
          </button>
        </div>
      </div>

      {/* ══ LIST VIEW ══ */}
      {view === 'list' && (
        <div style={{ marginBottom: '22px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '48px', color: 'var(--ct-text-muted)' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Loading interviews…</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="ct-card" style={{ padding: '60px', textAlign: 'center' }}>
              <Calendar size={40} style={{ margin: '0 auto 14px', opacity: 0.25 }} />
              <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--ct-text)', marginBottom: '6px' }}>No interviews yet</div>
              <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginBottom: '20px' }}>Add your first interview to start tracking your schedule.</div>
              <button onClick={() => navigate('/pipeline')} className="btn-primary"><Navigation size={14} /> Pipeline</button>
            </div>
          ) : (
            <>
              {/* TODAY */}
              {groups.today.length > 0 && (
                <>
                  <GroupHeader label="Today" count={groups.today.length} color="var(--ct-primary)" />
                  {groups.today.map(itv => <InterviewRow key={itv._id} itv={itv} onDelete={handleDelete} />)}
                </>
              )}

              {/* THIS WEEK */}
              {groups.thisWeek.length > 0 && (
                <>
                  <GroupHeader label="This Week" count={groups.thisWeek.length} color="var(--ct-success)" />
                  {groups.thisWeek.map(itv => <InterviewRow key={itv._id} itv={itv} onDelete={handleDelete} />)}
                </>
              )}

              {/* UPCOMING */}
              {groups.upcoming.length > 0 && (
                <>
                  <GroupHeader label="Upcoming" count={groups.upcoming.length} color="var(--ct-cyan)" />
                  {groups.upcoming.map(itv => <InterviewRow key={itv._id} itv={itv} onDelete={handleDelete} />)}
                </>
              )}

              {/* PAST (collapsible) */}
              {groups.past.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 10px', cursor: 'pointer' }} onClick={() => setShowPast(p => !p)}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ct-text-muted)' }}>Past</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', background: 'var(--ct-bg-secondary)', color: 'var(--ct-text-muted)', borderRadius: '10px', padding: '2px 8px' }}>{groups.past.length}</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--ct-border)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--ct-primary)', fontWeight: '600' }}>{showPast ? 'Hide' : 'Show'}</span>
                  </div>
                  {showPast && [...groups.past].reverse().map(itv => (
                    <div key={itv._id} style={{ opacity: 0.65 }}>
                      <InterviewRow itv={itv} onDelete={handleDelete} />
                    </div>
                  ))}
                </>
              )}

              {/* nothing active */}
              {groups.today.length === 0 && groups.thisWeek.length === 0 && groups.upcoming.length === 0 && (
                <div className="ct-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--ct-text-muted)', fontSize: '13px' }}>
                  No upcoming interviews. {groups.past.length > 0 && 'All interviews are in the past.'}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ CALENDAR VIEW ══ */}
      {view === 'calendar' && (
        <div style={{ marginBottom: '22px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '48px', color: 'var(--ct-text-muted)' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Loading…</span>
            </div>
          ) : (
            <CalendarView interviews={interviews} />
          )}
        </div>
      )}

    </div>
  );
};

export default Schedule;
