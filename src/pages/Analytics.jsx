import React, { useState } from 'react';
import { Mail, Users, Settings2, Clock, ChevronRight } from 'lucide-react';

/* ── Bar chart: Applications per month ── */
const BarChart = ({ activeFilter }) => {
  const months = ['Mar','Apr','May','Jun','Jul','Aug'];
  const inhouse  = [42, 61, 53, 78, 92, 74];
  const referral = [18, 29, 22, 35, 41, 30];
  const W = 460, H = 200, padB = 30, padT = 16, padL = 8, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxV = Math.max(...inhouse.map((v,i) => v + referral[i]));
  const barW = (chartW / months.length) * 0.55;
  const gap  = chartW / months.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      <defs>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {months.map((m, i) => {
        const cx   = padL + i * gap + gap / 2;
        const x    = cx - barW / 2;
        const v1   = inhouse[i];
        const v2   = referral[i];
        const h1   = (v1 / maxV) * chartH;
        const h2   = (v2 / maxV) * chartH;
        const isHighest = i === months.indexOf('Jul') || i === 4;
        return (
          <g key={m}>
            {/* Referral layer (lighter, bottom) */}
            {(activeFilter === 'all' || activeFilter === 'referral') && (
              <rect x={x} y={padT + chartH - h2} width={barW} height={h2}
                rx={5} fill="url(#barGrad2)" opacity={0.7} />
            )}
            {/* In-house layer (darker, on top) */}
            {(activeFilter === 'all' || activeFilter === 'inhouse') && (
              <rect x={x} y={padT + chartH - h1} width={barW} height={h1}
                rx={5} fill={isHighest ? 'url(#barGrad1)' : '#818cf8'} />
            )}
            <text x={cx} y={H - 8} textAnchor="middle"
              style={{ fontSize:'11px', fill:'var(--ct-text-muted)', fontFamily:'inherit' }}
            >{m}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Donut chart: Status distribution ── */
const DonutChart = () => {
  const r    = 68, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const segs = [
    { pct:42, color:'#10b981', label:'Interviewing' },
    { pct:18, color:'#7c5b1e', label:'Offer'        },
    { pct:25, color:'#ef4444', label:'Rejected'     },
    { pct:15, color:'#94a3b8', label:'Applied'      },
  ];
  let cum = 0;
  const startOff = circ * 0.25; // start from top

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
          style={{ fontSize:'24px', fontWeight:'800', fill:'var(--ct-text)', fontFamily:'inherit' }}>142</text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          style={{ fontSize:'9px', fontWeight:'700', fill:'var(--ct-text-muted)', letterSpacing:'0.06em', fontFamily:'inherit', textTransform:'uppercase' }}>TOTAL APPS</text>
      </svg>

      {/* Legend */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {segs.map((seg) => (
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
const FunnelRow = ({ label, count, pct, color }) => (
  <div style={{ marginBottom:'16px' }}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
      <span style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ct-text-muted)' }}>{label}</span>
      <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--ct-text)' }}>{count}</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width:`${pct}%`, background:color }} />
    </div>
  </div>
);

/* ── Applications by role ── */
const RoleRow = ({ role, count, max, color }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'12px' }}>
    <span style={{ fontSize:'13px', color:'var(--ct-text)', width:'120px', flexShrink:0 }}>{role}</span>
    <div style={{ flex:1, height:'8px', background:'var(--ct-border)', borderRadius:'4px', overflow:'hidden' }}>
      <div style={{ width:`${(count/max)*100}%`, height:'100%', background:color, borderRadius:'4px', transition:'width 0.7s ease' }} />
    </div>
    <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--ct-text)', width:'24px', textAlign:'right', flexShrink:0 }}>{count}</span>
  </div>
);

/* ── Bottom stat ── */
const StatChip = ({ label, value, icon:Icon, color }) => (
  <div style={{ textAlign:'center', padding:'4px' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'center', marginBottom:'4px' }}>
      <div style={{ fontSize:'22px', fontWeight:'800', color:'var(--ct-primary)', letterSpacing:'-0.03em' }}>{value}</div>
      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={17} style={{ color }} />
      </div>
    </div>
    <div style={{ fontSize:'11px', fontWeight:'600', letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--ct-text-muted)' }}>{label}</div>
  </div>
);

/* ── Main ── */
const Analytics = () => {
  const [chartFilter, setChartFilter] = useState('all');

  return (
    <div className="page-enter">
      {/* Page title */}
      <h1 className="page-title" style={{ marginBottom:'22px' }}>Analytics</h1>

      {/* Row 1: bar chart + donut */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'20px', marginBottom:'20px', alignItems:'start' }}>
        {/* Bar chart card */}
        <div className="ct-card" style={{ padding:'22px', borderLeft:'4px solid #f59e0b' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px', gap:'12px', flexWrap:'wrap' }}>
            <div>
              <div className="section-title">Applications Per Month</div>
              <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'3px' }}>Performance trajectory for Q3 2023</div>
            </div>
            <div style={{ display:'flex', gap:'7px' }}>
              {[{id:'all',label:'In-house'},{id:'referral',label:'Referral'}].map(f => (
                <button
                  key={f.id}
                  onClick={() => setChartFilter(f.id === chartFilter ? 'all' : f.id)}
                  style={{
                    padding:'5px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600',
                    cursor:'pointer', transition:'all 0.18s',
                    background: (chartFilter === f.id || chartFilter === 'all') ? (f.id === 'referral' ? '#10b981' : 'var(--ct-primary)') : 'var(--ct-bg)',
                    color: (chartFilter === f.id || chartFilter === 'all') ? '#fff' : 'var(--ct-text-muted)',
                    border:'none',
                  }}
                >{f.label}</button>
              ))}
            </div>
          </div>
          <BarChart activeFilter={chartFilter} />
        </div>

        {/* Donut card */}
        <div className="ct-card" style={{ padding:'22px', minWidth:'280px' }}>
          <div className="section-title" style={{ marginBottom:'18px' }}>Status Distribution</div>
          <DonutChart />
        </div>
      </div>

      {/* Row 2: funnel + by role */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {/* Conversion funnel */}
        <div className="ct-card" style={{ padding:'22px', borderLeft:'4px solid #6366f1' }}>
          <div className="section-title" style={{ marginBottom:'18px' }}>Conversion Funnel</div>
          <FunnelRow label="Applied"     count={142} pct={100} color="#4f46e5" />
          <FunnelRow label="Screening"   count={68}  pct={48}  color="#10b981" />
          <FunnelRow label="Technical"   count={24}  pct={17}  color="#f59e0b" />
          <FunnelRow label="Final Round" count={9}   pct={6}   color="#ef4444" />
        </div>

        {/* Applications by role */}
        <div className="ct-card" style={{ padding:'22px', borderLeft:'4px solid #6366f1' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
            <div className="section-title">Applications by Role</div>
            <button className="btn-ghost" id="view-all-roles-btn" style={{ fontSize:'12px' }}>
              View All <ChevronRight size={14} style={{ verticalAlign:'middle' }} />
            </button>
          </div>
          <RoleRow role="Product Designer" count={48} max={48} color="#818cf8" />
          <RoleRow role="UI Engineer"       count={32} max={48} color="#14b8a6" />
          <RoleRow role="Design Systems"    count={21} max={48} color="#f97316" />
          <RoleRow role="Creative Director" count={11} max={48} color="#f43f5e" />
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="ct-card" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0', overflow:'hidden' }}>
        {[
          { label:'Response Rate',  value:'73%',  icon:Mail,     color:'#4f46e5' },
          { label:'Interview Rate', value:'28%',  icon:Users,    color:'#10b981' },
          { label:'Offer Rate',     value:'12%',  icon:Settings2,color:'#f59e0b' },
          { label:'Time to Offer',  value:'22d',  icon:Clock,    color:'#f43f5e' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              padding:'22px', borderRight: i < 3 ? '1px solid var(--ct-border)' : 'none',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
            }}
          >
            <StatChip {...s} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
