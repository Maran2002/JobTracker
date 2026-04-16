import React, { useState, useEffect } from 'react';
import { Mail, Users, Settings2, Clock, ChevronRight, X } from 'lucide-react';
import api from '../api/gateway';

/* ── Bar chart: Applications per month ── */
const BarChart = ({ activeFilter, applications = [] }) => {
  // Generate last 6 months
  const now = new Date();
  const months = [];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  for (let i = 5; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: monthNames[d.getMonth()] });
  }

  const data = months.map(m => {
    let inhouse = 0;
    let referral = 0;
    applications.forEach(app => {
      const d = new Date(app.dateApplied || app.createdAt);
      if (d.getFullYear() === m.year && d.getMonth() === m.month) {
        if (app.source && app.source.toLowerCase().includes('referral')) {
          referral++;
        } else {
          inhouse++;
        }
      }
    });
    return { ...m, inhouse, referral };
  });

  const W = 460, H = 200, padB = 30, padT = 16, padL = 8, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxV = Math.max(1, ...data.map(d => d.inhouse + d.referral));
  const barW = (chartW / months.length) * 0.55;
  const gap  = chartW / months.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      <defs>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--ct-primary)" />
          <stop offset="100%" stopColor="var(--ct-primary-dark)" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--ct-primary-light)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--ct-primary)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {data.map((m, i) => {
        const cx   = padL + i * gap + gap / 2;
        const x    = cx - barW / 2;
        const v1   = m.inhouse;
        const v2   = m.referral;
        const h1   = (v1 / maxV) * chartH;
        const h2   = (v2 / maxV) * chartH;
        
        let highestIndex = 0;
        let highestVal = 0;
        data.forEach((d, idx) => { if (d.inhouse + d.referral > highestVal) { highestVal = d.inhouse + d.referral; highestIndex = idx; }});
        const isHighest = i === highestIndex;

        return (
          <g key={m.label + i}>
            {/* Referral layer (lighter, bottom) */}
            {(activeFilter === 'all' || activeFilter === 'referral') && (
              <rect x={x} y={padT + chartH - h2} width={barW} height={h2}
                rx={5} fill="url(#barGrad2)" />
            )}
            {/* In-house layer (darker, on top) */}
            {(activeFilter === 'all' || activeFilter === 'inhouse') && (
              <rect x={x} y={padT + chartH - h1 - (activeFilter === 'all' ? h2 : 0)} width={barW} height={h1}
                rx={5} fill={isHighest ? 'url(#barGrad1)' : 'var(--ct-primary)'} opacity={isHighest ? 1 : 0.7} />
            )}
            <text x={cx} y={H - 8} textAnchor="middle"
              style={{ fontSize:'11px', fill:'var(--ct-text-muted)', fontFamily:'inherit' }}
            >{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Donut chart: Status distribution ── */
const DonutChart = ({ byStatus, total }) => {
  const r    = 68, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  
  const rawSegs = [
    { key: 'Interviewing', color: '#10b981', label: 'Interviewing' },
    { key: 'Offer Received', color: '#f59e0b', label: 'Offer' },
    { key: 'Rejected', color: '#ef4444', label: 'Rejected' },
    { key: 'Applied', color: '#94a3b8', label: 'Applied' },
    { key: 'Screening', color: '#06b6d4', label: 'Screening' }
  ];

  const segs = rawSegs.map(s => {
    const count = byStatus[s.key] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...s, count, pct };
  }).filter(s => s.count > 0);

  if (segs.length === 0) {
    segs.push({ pct: 100, color: '#e2e8f0', label: 'No Data' });
  }

  let cum = 0;
  const startOff = circ * 0.25;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ flexShrink:0 }}>
        {segs.map((seg, i) => {
          const dash   = (seg.pct / 100) * circ;
          const offset = -((cum / 100) * circ) + startOff;
          cum += seg.pct;
          return (
            <circle
              key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth={22}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              style={{ transition:'stroke-dasharray 0.8s ease' }}
            />
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle"
          style={{ fontSize:'24px', fontWeight:'800', fill:'var(--ct-text)', fontFamily:'inherit' }}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          style={{ fontSize:'9px', fontWeight:'700', fill:'var(--ct-text-muted)', letterSpacing:'0.06em', fontFamily:'inherit', textTransform:'uppercase' }}>TOTAL APPS</text>
      </svg>

      {/* Legend */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {segs.filter(s => s.label !== 'No Data').map((seg) => (
          <div key={seg.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'32px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ width:'9px', height:'9px', borderRadius:'50%', background:seg.color, flexShrink:0 }} />
              <span style={{ fontSize:'13px', color:'var(--ct-text)' }}>{seg.label}</span>
            </div>
            <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--ct-text)' }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Conversion funnel ── */
const FunnelRow = ({ label, count, pct, color }) => {
  const isPrimary = color === '#4f46e5' || color === 'var(--ct-primary)';
  const barColor = isPrimary ? 'var(--ct-primary)' : color;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ct-text-muted)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ct-text)' }}>{count} <span style={{ opacity: 0.6, fontSize: '11px', marginLeft: '4px' }}>({pct}%)</span></span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--ct-border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
};

/* ── Applications by role ── */
const RoleRow = ({ role, count, max, color }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'12px' }}>
    <span style={{ fontSize:'13px', color:'var(--ct-text)', width:'120px', flexShrink:0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role}</span>
    <div style={{ flex:1, height:'8px', background:'var(--ct-border)', borderRadius:'4px', overflow:'hidden' }}>
      <div style={{ width:`${max > 0 ? (count/max)*100 : 0}%`, height:'100%', background:color, borderRadius:'4px', transition:'width 0.7s ease' }} />
    </div>
    <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--ct-text)', width:'24px', textAlign:'right', flexShrink:0 }}>{count}</span>
  </div>
);

/* ── Bottom stat ── */
const StatChip = ({ label, value, icon: Icon, color }) => {
  const isPrimary = color === '#4f46e5' || color === 'var(--ct-primary)';
  const iconColor = isPrimary ? 'var(--ct-primary)' : color;
  const bgColor = isPrimary ? 'var(--ct-primary-light)' : `${color}18`;
  const valColor = isPrimary ? 'var(--ct-primary)' : 'var(--ct-primary)'; // value is usually primary anyway

  return (
    <div style={{ textAlign: 'center', padding: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--ct-primary)', letterSpacing: '-0.03em' }}>{value}</div>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} style={{ color: iconColor }} />
        </div>
      </div>
      <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ct-text-muted)' }}>{label}</div>
    </div>
  );
};

/* ── Main ── */
const Analytics = () => {
  const [chartFilter, setChartFilter] = useState('all');
  const [stats, setStats] = useState({ totalApplications: 0, byStatus: {} });

  useEffect(() => {
    api.get('/analytics')
      .then(res => setStats(res.data))
      .catch(err => console.error('Analytics fetch error', err));
  }, []);

  const total = stats.totalApplications || 0;
  const byStatus = stats.byStatus || {};
  const applications = stats.applications || [];
  const interviewing = byStatus['Interviewing'] || 0;
  const offers = byStatus['Offer Received'] || 0;
  const rejected = byStatus['Rejected'] || 0;
  const applied = byStatus['Applied'] || 0;
  const screening = byStatus['Screening'] || 0;

  // Compute calculated metrics
  const responded = total - applied;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const interviewRate = total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
  
  // Calculate avg time to offer (mock logic scaling based on real total for demo purposes)
  let timeToOffer = '0d';
  if (offers > 0) {
    const offerApps = applications.filter(a => a.status === 'Offer Received');
    if (offerApps.length > 0) {
      const avgDays = Math.round(offerApps.reduce((acc, app) => {
        const d1 = new Date(app.createdAt);
        const d2 = new Date(app.updatedAt);
        return acc + Math.max(1, (d2 - d1) / (1000 * 60 * 60 * 24));
      }, 0) / offerApps.length);
      timeToOffer = `${avgDays}d`;
    }
  }

  // Top roles
  const rolesCount = {};
  applications.forEach(a => rolesCount[a.title] = (rolesCount[a.title] || 0) + 1);
  const topRoles = Object.entries(rolesCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 4);
    
  const colors = ['#818cf8', '#14b8a6', '#f97316', '#f43f5e'];

  return (
    <div className="page-enter">
      {/* Page title */}
      <h1 className="page-title" style={{ marginBottom:'22px' }}>Analytics</h1>

      {/* Row 1: bar chart + donut */}
      <div className="rg-1auto" style={{ marginBottom:'20px' }}>
        {/* Bar chart card */}
        <div className="ct-card" style={{ padding:'22px', borderLeft:'4px solid #f59e0b' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px', gap:'12px', flexWrap:'wrap' }}>
            <div>
              <div className="section-title">Applications Per Month</div>
              <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'3px' }}>Performance trajectory for the last 6 months</div>
            </div>
            <div style={{ display:'flex', gap:'7px' }}>
              {[{id:'all',label:'All'},{id:'referral',label:'Referrals'},{id:'inhouse',label:'Direct'}].map(f => (
                <button
                  key={f.id}
                  onClick={() => setChartFilter(f.id)}
                  style={{
                    padding:'5px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600',
                    cursor:'pointer', transition:'all 0.18s',
                    background: chartFilter === f.id ? (f.id === 'referral' ? '#10b981' : 'var(--ct-primary)') : 'var(--ct-bg)',
                    color: chartFilter === f.id ? '#fff' : 'var(--ct-text-muted)',
                    border:'none',
                  }}
                >{f.label}</button>
              ))}
            </div>
          </div>
          <BarChart activeFilter={chartFilter} applications={applications} />
        </div>

        {/* Donut card */}
        <div className="ct-card" style={{ padding:'22px', minWidth:'280px' }}>
          <div className="section-title" style={{ marginBottom:'18px' }}>Status Distribution</div>
          <DonutChart byStatus={byStatus} total={total} />
          <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--ct-text-muted)' }}>
            Total tracked: <strong style={{ color: 'var(--ct-text)' }}>{total}</strong> applications
          </div>
        </div>
      </div>

      {/* Row 2: funnel + by role */}
      <div className="rg-2" style={{ gap:'20px', marginBottom:'20px' }}>
        {/* Conversion funnel */}
        <div className="ct-card" style={{ padding:'22px', borderLeft:'4px solid #6366f1' }}>
          <div className="section-title" style={{ marginBottom:'18px' }}>Conversion Funnel</div>
          <FunnelRow label="Applied"     count={applied + screening + interviewing + offers + rejected} pct={total > 0 ? 100 : 0} color="var(--ct-primary)" />
          <FunnelRow label="Screening"   count={screening + interviewing + offers} pct={total > 0 ? Math.round(((screening + interviewing + offers) / total) * 100) : 0}  color="#10b981" />
          <FunnelRow label="Interviewing" count={interviewing + offers} pct={total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0}  color="#f59e0b" />
          <FunnelRow label="Offer"       count={offers}  pct={total > 0 ? Math.round((offers / total) * 100) : 0}   color="#ef4444" />
        </div>

        {/* Applications by role */}
        <div className="ct-card" style={{ padding:'22px', borderLeft:'4px solid #6366f1' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
            <div className="section-title">Applications by Role</div>
            {/* <button className="btn-ghost" id="view-all-roles-btn" style={{ fontSize:'12px' }}>
              View All <ChevronRight size={14} style={{ verticalAlign:'middle' }} />
            </button> */}
          </div>
          {topRoles.length > 0 ? topRoles.map(([role, count], i) => (
             <RoleRow key={role} role={role} count={count} max={topRoles[0][1]} color={colors[i % colors.length]} />
          )) : <div style={{ color: 'var(--ct-text-muted)', fontSize: '13px' }}>No roles found yet.</div>}
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="ct-card rg-4strip">
        {[
          { label:'Response Rate',  value: `${responseRate}%`,  icon:Mail,     color:'var(--ct-primary)' },
          { label:'Interview Rate', value: `${interviewRate}%`,  icon:Users,    color:'#10b981' },
          { label:'Offer Rate',     value: `${offerRate}%`,  icon:Settings2,color:'#f59e0b' },
          { label:'Rejection Rate', value: `${rejectionRate}%`,  icon:X,    color:'#f43f5e' },
        ].map((s) => (
          <div key={s.label} className="rg-4strip-item">
            <StatChip {...s} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
