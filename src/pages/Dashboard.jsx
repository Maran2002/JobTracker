import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, MessageSquare, PartyPopper, XCircle,
  ChevronRight, MapPin, Download, Loader2,
  Video, Building2, TrendingUp, Target, Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import api from '../api/gateway';
import useAuthStore from '../store/useAuthStore';
import { formatSalary } from '../utils/formatSalary';

/* ════════════════════════════════════
   HELPERS
   ════════════════════════════════════ */

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

/* safely parse any date value */
const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

/* bucket applications by the last N weeks */
const weeklyBuckets = (apps, n = 6) => {
  const now = new Date();
  return Array.from({ length: n }, (_, rev) => {
    const i = n - 1 - rev;
    const end   = new Date(now); end.setDate(now.getDate() - i * 7); end.setHours(23,59,59,999);
    const start = new Date(end); start.setDate(end.getDate() - 6);   start.setHours(0,0,0,0);
    const count = apps.filter(a => { const d = safeDate(a.dateApplied); return d && d >= start && d <= end; }).length;
    const label = i === 0 ? 'This wk' : i === 1 ? 'Last wk' : `${i}w ago`;
    return { label, count };
  });
};

/* bucket applications by the last N months */
const monthlyBuckets = (apps, n = 6) => {
  const now = new Date();
  return Array.from({ length: n }, (_, rev) => {
    const i = n - 1 - rev;
    const y = now.getFullYear(), m = now.getMonth() - i;
    const start = new Date(y, m, 1);
    const end   = new Date(y, m + 1, 0, 23, 59, 59);
    const count = apps.filter(a => { const d = safeDate(a.dateApplied); return d && d >= start && d <= end; }).length;
    const label = start.toLocaleDateString('en-US', { month:'short' });
    return { label, count };
  });
};

/* month-over-month trend for a given array of apps */
const monthTrend = (apps) => {
  const now = new Date();
  const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const thisN = apps.filter(a => { const d = safeDate(a.dateApplied); return d && d >= thisStart; }).length;
  const lastN = apps.filter(a => { const d = safeDate(a.dateApplied); return d && d >= lastStart && d <= lastEnd; }).length;
  if (lastN === 0) return { text: thisN > 0 ? `+${thisN} this mo.` : '—', positive: true };
  const pct = Math.round(((thisN - lastN) / lastN) * 100);
  return { text: `${pct >= 0 ? '+' : ''}${pct}%`, positive: pct >= 0 };
};

/* ── XLSX download ── */
const downloadReport = (apps, interviews) => {
  const wb = XLSX.utils.book_new();

  /* --- Summary sheet --- */
  const byStatus = ['Applied','Screening','Interviewing','Offer Received','Rejected'];
  const summaryRows = [
    ['CareerTrack – Job Search Report'],
    ['Generated', new Date().toLocaleDateString('en-US', { dateStyle:'long' })],
    [],
    ['OVERVIEW', ''],
    ['Total Applications',  apps.length],
    ['Total Interviews',    interviews.length],
    ['Offers Received',     apps.filter(a => a.status === 'Offer Received').length],
    ['Rejections',          apps.filter(a => a.status === 'Rejected').length],
    ['In Progress',         apps.filter(a => !['Offer Received','Rejected'].includes(a.status)).length],
    [],
    ['BY STATUS', 'Count'],
    ...byStatus.map(s => [s, apps.filter(a => a.status === s).length]),
    [],
    ['RATES', ''],
    ['Response Rate', apps.length ? `${Math.round((apps.filter(a => a.status !== 'Applied').length / apps.length) * 100)}%` : '—'],
    ['Interview Rate', apps.length ? `${Math.round((apps.filter(a => ['Interviewing','Offer Received'].includes(a.status)).length / apps.length) * 100)}%` : '—'],
    ['Offer Rate',    apps.length ? `${Math.round((apps.filter(a => a.status === 'Offer Received').length / apps.length) * 100)}%` : '—'],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  summaryWs['!cols'] = [{ wch: 22 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  /* --- Applications sheet --- */
  if (apps.length) {
    const rows = apps.map(a => ({
      'Job Title':    a.title,
      'Company':      a.company,
      'Location':     a.location,
      'Status':       a.status,
      'Priority':     a.priority  || '',
      'Job Type':     a.jobType   || '',
      'Work Mode':    a.workMode  || '',
      'Salary':       formatSalary(a.salary, a.currency),
      'Date Applied': safeDate(a.dateApplied)?.toLocaleDateString('en-GB') || '',
      'Deadline':     safeDate(a.deadline)?.toLocaleDateString('en-GB')    || '',
      'Source':       a.source    || '',
      'Job URL':      a.jobUrl    || '',
      'HR Name':      a.hrName    || '',
      'HR Email':     a.hrEmail   || '',
      'Skills':       a.skills    || '',
      'Notes':        a.notes     || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0]).map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String(r[k] || '').length)) + 2,
    }));
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
  }

  /* --- Interviews sheet --- */
  if (interviews.length) {
    const rows = interviews.map(i => ({
      'Position':         i.title    || '',
      'Company':          i.company  || '',
      'Date':             i.date     || '',
      'Time':             i.time     || '',
      'Type':             i.type     || '',
      'Location / Venue': i.venue || i.location || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0]).map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String(r[k] || '').length)) + 2,
    }));
    XLSX.utils.book_append_sheet(wb, ws, 'Interviews');
  }

  XLSX.writeFile(wb, `CareerTrack_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/* ════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════ */

/* ── Trend badge ── */
const Trend = ({ text, positive }) => (
  <span style={{
    fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'20px',
    background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
    color: positive ? 'var(--ct-success)' : 'var(--ct-danger)',
    whiteSpace: 'nowrap',
  }}>
    {positive ? '↑' : '↓'} {text}
  </span>
);

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, trendText, trendPos, color, delay }) => (
  <div className={`stat-card anim-fade-up ${delay}`} style={{ borderTop:`3px solid ${color}` }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
      <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <Trend text={trendText} positive={trendPos} />
    </div>
    <div style={{ fontSize:'11px', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ct-text-muted)', marginBottom:'6px' }}>
      {label}
    </div>
    <div style={{ fontSize:'30px', fontWeight:'800', color:'var(--ct-text)', letterSpacing:'-0.03em' }}>
      {value}
    </div>
  </div>
);

/* ── Dynamic area chart ── */
const AreaChart = ({ buckets }) => {
  const W = 460, H = 160, pad = { t: 24, b: 30, l: 10, r: 10 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const maxVal = Math.max(...buckets.map(b => b.count), 1);
  const xStep  = buckets.length > 1 ? chartW / (buckets.length - 1) : 0;

  const pts = buckets.map((b, i) => ({
    x: pad.l + i * xStep,
    y: pad.t + chartH - (b.count / maxVal) * chartH,
    ...b,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts.at(-1).x},${pad.t + chartH} L${pts[0].x},${pad.t + chartH} Z`;
  const peakIdx  = buckets.reduce((max, b, i) => b.count > buckets[max].count ? i : max, 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      <defs>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4f46e5" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {[0,1,2,3].map(i => (
        <line key={i}
          x1={pad.l} y1={pad.t + (chartH / 3) * i}
          x2={W - pad.r} y2={pad.t + (chartH / 3) * i}
          stroke="var(--ct-border)" strokeWidth="1" strokeDasharray="4 4"
        />
      ))}

      <path d={areaPath} fill="url(#areaGrad2)" />
      <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y}
            r={i === peakIdx ? 6 : 4}
            fill={i === peakIdx ? '#4f46e5' : 'var(--ct-card)'}
            stroke={i === peakIdx ? '#4f46e5' : 'var(--ct-border)'}
            strokeWidth="2"
          />
          {i === peakIdx && p.count > 0 && (
            <text x={p.x} y={p.y - 9} textAnchor="middle"
              style={{ fontSize:'9px', fill:'#4f46e5', fontWeight:'700', fontFamily:'inherit' }}>
              {p.count}
            </text>
          )}
        </g>
      ))}

      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 6} textAnchor="middle"
          style={{ fontSize:'5.5px', fill: i === peakIdx ? '#4f46e5' : 'var(--ct-text-muted)', fontWeight: i === peakIdx ? '700' : '400', fontFamily:'inherit' }}>
          {p.label}
        </text>
      ))}
    </svg>
  );
};

/* ── Interview card ── */
const InterviewCard = ({ interview }) => {
  const parsed = safeDate(interview.date);
  const today  = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const dayLabel = (() => {
    if (!parsed) return interview.date || 'Date TBD';
    const d = new Date(parsed); d.setHours(0,0,0,0);
    if (d.getTime() === today.getTime())    return 'Today';
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return parsed.toLocaleDateString('en-US', { month:'short', day:'numeric' });
  })();

  const isToday   = dayLabel === 'Today';
  const isVideo   = interview.type === 'VIDEO CALL';
  const venue     = interview.venue || interview.location;

  return (
    <div style={{
      padding:'14px', borderRadius:'11px', marginBottom:'10px',
      background: isToday ? 'var(--ct-primary-light)' : 'var(--ct-bg)',
      border:`1px solid ${isToday ? 'rgba(79,70,229,0.22)' : 'var(--ct-border)'}`,
    }}>
      <div style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:'5px', display:'flex', alignItems:'center', gap:'6px', color: isToday ? 'var(--ct-primary)' : 'var(--ct-text-muted)' }}>
        <span style={{ width:'7px', height:'7px', borderRadius:'50%', display:'inline-block', background: isToday ? 'var(--ct-primary)' : 'var(--ct-text-muted)' }} />
        {dayLabel}{interview.time ? ` · ${interview.time}` : ''}
      </div>
      <div style={{ fontWeight:'700', fontSize:'13px', color:'var(--ct-text)', marginBottom:'1px' }}>{interview.title}</div>
      <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginBottom:'8px' }}>{interview.company}</div>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
        {interview.type && (
          <span style={{
            fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px',
            background: isVideo ? 'var(--ct-success-light)' : 'var(--ct-warning-light)',
            color: isVideo ? 'var(--ct-success)' : 'var(--ct-warning)',
          }}>
            {interview.type}
          </span>
        )}
        {venue && (
          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'var(--ct-text-muted)' }}>
            <MapPin size={10} />{venue}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Recent app row ── */
const AppRow = ({ app, onClick }) => {
  const statusClass = {
    'Interviewing':   'badge-interviewing',
    'Applied':        'badge-applied',
    'Offer Received': 'badge-offer',
    'Rejected':       'badge-rejected',
    'Screening':      'badge-screening',
  };
  return (
    <div
      onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 0', borderBottom:'1px solid var(--ct-border)', cursor:'pointer', transition:'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <div className="company-avatar" style={{ background:`${app.color || '#4f46e5'}18`, color: app.color || '#4f46e5', fontSize:'13px', width:'40px', height:'40px', borderRadius:'10px' }}>
        {app.logo || app.company?.slice(0,2).toUpperCase()}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:'700', fontSize:'13px', color:'var(--ct-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.title}</div>
        <div style={{ fontSize:'11px', color:'var(--ct-text-muted)', marginTop:'2px' }}>
          {app.company}
          {app.salary && app.salary !== 'Not Disclosed' && (
            <span style={{ marginLeft:'6px', color:'var(--ct-text-secondary)' }}>· {formatSalary(app.salary, app.currency)}</span>
          )}
        </div>
      </div>
      <span className={`badge ${statusClass[app.status] || ''}`}>{app.status}</span>
      <ChevronRight size={14} style={{ color:'var(--ct-text-muted)', flexShrink:0 }} />
    </div>
  );
};

/* ── Rate metric pill ── */
const RatePill = ({ icon: Icon, label, value, color }) => (
  <div style={{
    flex:1, minWidth:'120px',
    padding:'14px 16px', borderRadius:'12px',
    background:'var(--ct-card)', border:'1px solid var(--ct-border)',
    display:'flex', alignItems:'center', gap:'12px',
  }}>
    <div style={{ width:'36px', height:'36px', borderRadius:'9px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ct-text-muted)', marginBottom:'3px' }}>{label}</div>
      <div style={{ fontSize:'20px', fontWeight:'800', color:'var(--ct-text)', letterSpacing:'-0.02em' }}>{value}</div>
    </div>
  </div>
);

/* ── Status progress bar — fully inlined to avoid @heroui/styles class conflicts ── */
const StatusBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom:'13px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
        <span style={{ fontSize:'12px', fontWeight:'600', color:'var(--ct-text-secondary)' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={{ fontSize:'12px', fontWeight:'700', color:'var(--ct-text)' }}>{count}</span>
          <span style={{ fontSize:'10px', color:'var(--ct-text-muted)' }}>{pct}%</span>
        </div>
      </div>
      {/* track */}
      <div style={{ height:'7px', borderRadius:'4px', background:'var(--ct-border)', overflow:'hidden' }}>
        {/* fill — explicit display:block prevents any flex/grid reset shrinking the element */}
        <div style={{
          display: 'block',
          height: '100%',
          width: `${pct}%`,
          minWidth: pct > 0 ? '4px' : '0',
          borderRadius: '4px',
          background: color,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
};


/* ════════════════════════════════════
   DASHBOARD PAGE
   ════════════════════════════════════ */
const Dashboard = () => {
  const navigate  = useNavigate();
  const user      = useAuthStore(s => s.user);
  const [apps,    setApps]       = useState([]);
  const [itvs,    setItvs]       = useState([]);
  const [loading, setLoading]    = useState(true);
  const [period,  setPeriod]     = useState('weeks'); // 'weeks' | 'months'

  useEffect(() => {
    (async () => {
      try {
        const [a, i] = await Promise.all([api.get('/applications'), api.get('/interviews')]);
        setApps(a.data);
        setItvs(i.data);
      } catch (e) {
        console.error('Dashboard fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── derived stats ── */
  const totalApps    = apps.length;
  const totalItvs    = itvs.length;
  const totalOffers  = useMemo(() => apps.filter(a => a.status === 'Offer Received').length, [apps]);
  const totalRej     = useMemo(() => apps.filter(a => a.status === 'Rejected').length,       [apps]);
  const inProgress   = useMemo(() => apps.filter(a => !['Offer Received','Rejected'].includes(a.status)).length, [apps]);

  const appTrend = useMemo(() => monthTrend(apps),                                    [apps]);
  const itvTrend = useMemo(() => monthTrend(itvs.map(i => ({ dateApplied: i.createdAt }))), [itvs]);

  const responseRate = totalApps ? Math.round((apps.filter(a => a.status !== 'Applied').length / totalApps) * 100) : 0;
  const interviewRate = totalApps ? Math.round((apps.filter(a => ['Interviewing','Offer Received'].includes(a.status)).length / totalApps) * 100) : 0;
  const offerRate     = totalApps ? Math.round((totalOffers / totalApps) * 100) : 0;

  /* ── chart data ── */
  const chartBuckets = useMemo(
    () => period === 'weeks' ? weeklyBuckets(apps, 6) : monthlyBuckets(apps, 6),
    [apps, period]
  );
  const chartTotal = chartBuckets.reduce((s, b) => s + b.count, 0);

  /* ── upcoming interviews: sorted chronologically, future first ── */
  const upcomingInterviews = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const withDates = itvs.map(i => ({ ...i, _parsed: safeDate(i.date) }));
    const future = withDates.filter(i => !i._parsed || i._parsed >= now)
      .sort((a, b) => {
        if (!a._parsed && !b._parsed) return 0;
        if (!a._parsed) return 1;
        if (!b._parsed) return -1;
        return a._parsed - b._parsed;
      });
    return future.slice(0, 3);
  }, [itvs]);

  /* ── recent applications: sorted newest first ── */
  const recentApps = useMemo(
    () => [...apps]
      .sort((a, b) => (safeDate(b.dateApplied) || 0) - (safeDate(a.dateApplied) || 0))
      .slice(0, 5),
    [apps]
  );

  /* ── greeting subtitle ── */
  const subtitleMsg = (() => {
    if (loading) return 'Loading your pipeline…';
    const parts = [];
    if (inProgress > 0) parts.push(`${inProgress} active pursuit${inProgress !== 1 ? 's' : ''}`);
    if (upcomingInterviews.length > 0) parts.push(`${upcomingInterviews.length} upcoming interview${upcomingInterviews.length !== 1 ? 's' : ''}`);
    if (parts.length === 0) return 'Your pipeline is all clear — time to apply!';
    return `You have ${parts.join(' and ')} today.`;
  })();

  /* ── loading splash ── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px', gap:'12px', color:'var(--ct-text-muted)' }}>
      <Loader2 size={22} style={{ animation:'spin 1s linear infinite' }} />
      <span style={{ fontSize:'14px', fontWeight:'600' }}>Loading dashboard…</span>
    </div>
  );

  return (
    <div className="page-enter">

      {/* ── Page header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'26px', flexWrap:'wrap', gap:'14px' }}>
        <div>
          <h1 className="page-title">{getGreeting()}, {user?.name ?? 'there'} 👋</h1>
          <p className="page-subtitle" style={{ marginTop:'4px' }}>{subtitleMsg}</p>
          <p style={{ fontSize:'11px', color:'var(--ct-text-muted)', marginTop:'4px', fontWeight:'500' }}>{todayLabel()}</p>
        </div>
        <button
          className="btn-secondary"
          id="download-report-btn"
          onClick={() => downloadReport(apps, itvs)}
          disabled={totalApps === 0}
          title="Download full report as XLSX"
        >
          <Download size={15} /> Download Report
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'16px', marginBottom:'20px' }}>
        <StatCard icon={FileText}      label="Total Applications" value={totalApps}   trendText={appTrend.text}  trendPos={appTrend.positive}  color="#4f46e5" delay="stagger-1" />
        <StatCard icon={MessageSquare} label="Interviews"         value={totalItvs}   trendText={itvTrend.text}  trendPos={itvTrend.positive}  color="#10b981" delay="stagger-2" />
        <StatCard icon={PartyPopper}   label="Offers"             value={totalOffers} trendText={totalOffers > 0 ? `${offerRate}% rate` : 'None yet'} trendPos={totalOffers > 0} color="#f59e0b" delay="stagger-3" />
        <StatCard icon={XCircle}       label="Rejections"         value={totalRej}    trendText={totalRej > 0 ? `${Math.round((totalRej/totalApps)*100)}% rate` : 'None yet'} trendPos={false} color="#ef4444" delay="stagger-4" />
      </div>

      {/* ── Quick rate metrics ── */}
      {totalApps > 0 && (
        <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
          <RatePill icon={TrendingUp} label="Response Rate"  value={`${responseRate}%`}  color="#4f46e5" />
          <RatePill icon={Target}     label="Interview Rate" value={`${interviewRate}%`}  color="#10b981" />
          <RatePill icon={PartyPopper} label="Offer Rate"    value={`${offerRate}%`}      color="#f59e0b" />
          <RatePill icon={Calendar}   label="In Progress"    value={inProgress}            color="#06b6d4" />
        </div>
      )}

      {/* ── Chart + Upcoming Interviews ── */}
      <div className="rg-sidebar" style={{ marginBottom:'20px' }}>

        {/* Area chart */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
            <div>
              <div className="section-title">Applications Over Time</div>
              <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'3px' }}>
                {chartTotal} application{chartTotal !== 1 ? 's' : ''} in the displayed period
              </div>
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              {[['weeks','By Week'],['months','By Month']].map(([val, lbl]) => (
                <button key={val} onClick={() => setPeriod(val)}
                  style={{
                    fontSize:'11px', padding:'5px 12px', borderRadius:'20px', cursor:'pointer', fontWeight:'600',
                    border:`1px solid ${period === val ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
                    background: period === val ? 'var(--ct-primary-light)' : 'transparent',
                    color: period === val ? 'var(--ct-primary)' : 'var(--ct-text-secondary)',
                    transition:'all 0.18s',
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          {chartTotal === 0 ? (
            <div style={{ height:'100px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ct-text-muted)', fontSize:'13px' }}>
              No application data yet for this period.
            </div>
          ) : (
            <AreaChart buckets={chartBuckets} />
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div className="section-title">Upcoming Interviews</div>
            {itvs.length > 0 && (
              <span style={{ fontSize:'11px', fontWeight:'700', background:'var(--ct-success-light)', color:'var(--ct-success)', borderRadius:'10px', padding:'2px 8px' }}>
                {itvs.length} total
              </span>
            )}
          </div>

          {upcomingInterviews.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center', color:'var(--ct-text-muted)', fontSize:'13px' }}>
              No upcoming interviews.
              <br />
              <button onClick={() => navigate('/schedule')} className="btn-ghost" style={{ marginTop:'10px', fontSize:'12px' }}>
                Go to Schedule
              </button>
            </div>
          ) : (
            upcomingInterviews.map((itv) => (
              <InterviewCard key={itv._id} interview={itv} />
            ))
          )}

          <button
            className="btn-secondary"
            style={{ width:'100%', justifyContent:'center', marginTop:'8px', fontSize:'12px' }}
            onClick={() => navigate('/schedule')}
          >
            View Schedule
          </button>
        </div>
      </div>

      {/* ── Recent Applications + Status Breakdown ── */}
      <div className="rg-sidebar">

        {/* Recent Applications */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
            <div className="section-title">Recent Applications</div>
            <button onClick={() => navigate('/applications')} className="btn-ghost" style={{ fontSize:'12px' }}>
              View All
            </button>
          </div>

          {recentApps.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center', color:'var(--ct-text-muted)', fontSize:'13px' }}>
              No applications yet.
              <br />
              <button onClick={() => navigate('/applications/new')} className="btn-primary" style={{ marginTop:'12px', fontSize:'12px' }}>
                Add your first application
              </button>
            </div>
          ) : (
            recentApps.map(app => (
              <AppRow
                key={app._id}
                app={app}
                onClick={() => navigate('/applications')}
              />
            ))
          )}
        </div>

        {/* Pipeline Status Breakdown */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div className="section-title" style={{ marginBottom:'18px' }}>Pipeline Breakdown</div>

          {totalApps === 0 ? (
            <div style={{ padding:'16px 0', textAlign:'center', color:'var(--ct-text-muted)', fontSize:'13px' }}>
              No data yet.
            </div>
          ) : (
            <>
              <StatusBar label="Applied"        count={apps.filter(a => a.status === 'Applied').length}        total={totalApps} color="#4f46e5" />
              <StatusBar label="Screening"      count={apps.filter(a => a.status === 'Screening').length}      total={totalApps} color="#06b6d4" />
              <StatusBar label="Interviewing"   count={apps.filter(a => a.status === 'Interviewing').length}   total={totalApps} color="#10b981" />
              <StatusBar label="Offer Received" count={totalOffers}                                             total={totalApps} color="#f59e0b" />
              <StatusBar label="Rejected"       count={totalRej}                                               total={totalApps} color="#ef4444" />

              <div style={{ marginTop:'18px', paddingTop:'14px', borderTop:'1px solid var(--ct-border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--ct-text-muted)', fontWeight:'600', marginBottom:'4px' }}>
                  <span>Active pipeline</span>
                  <span style={{ color:'var(--ct-primary)', fontWeight:'700' }}>{inProgress} open</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--ct-text-muted)', fontWeight:'600' }}>
                  <span>Success rate</span>
                  <span style={{ color: offerRate > 0 ? 'var(--ct-success)' : 'var(--ct-text-muted)', fontWeight:'700' }}>
                    {offerRate}%
                  </span>
                </div>
              </div>
            </>
          )}

          <button
            className="btn-secondary"
            style={{ width:'100%', justifyContent:'center', marginTop:'16px', fontSize:'12px' }}
            onClick={() => navigate('/pipeline')}
          >
            Open Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
