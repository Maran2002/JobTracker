import React from 'react';
import { FileText, MessageSquare, PartyPopper, XCircle, ChevronRight, CheckCircle2, Circle, MapPin, Video } from 'lucide-react';

/* ── helpers ── */
const Trend = ({ value, positive }) => (
  <span style={{
    fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px',
    background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
    color: positive ? 'var(--ct-success)' : 'var(--ct-danger)',
  }}>
    {positive ? '↑' : '↓'} {value}
  </span>
);

/* ── mini area SVG chart ── */
const AreaChart = () => {
  const data = [3, 8, 5, 10, 7];
  const W = 460, H = 160, pad = { t: 20, b: 30, l: 10, r: 10 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const max = Math.max(...data) + 2;
  const xStep = chartW / (data.length - 1);

  const pts = data.map((v, i) => ({
    x: pad.l + i * xStep,
    y: pad.t + chartH - (v / max) * chartH,
  }));

  const linePath  = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath  = linePath + ` L${pts[pts.length-1].x},${pad.t+chartH} L${pts[0].x},${pad.t+chartH} Z`;
  const weeks     = ['WK 1','WK 2','WK 3','WK 4','WK 5'];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4f46e5" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {[0,1,2,3].map(i => (
        <line
          key={i}
          x1={pad.l} y1={pad.t + (chartH/3)*i}
          x2={W-pad.r} y2={pad.t + (chartH/3)*i}
          stroke="var(--ct-border)" strokeWidth="1" strokeDasharray="4 4"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === 2 ? 6 : 4}
            fill={i === 2 ? '#4f46e5' : 'var(--ct-card)'}
            stroke={i === 2 ? '#4f46e5' : 'var(--ct-border)'}
            strokeWidth="2"
          />
        </g>
      ))}

      {/* Week labels */}
      {pts.map((p, i) => (
        <text
          key={i} x={p.x} y={H - 6}
          textAnchor="middle"
          style={{ fontSize:'11px', fill: i === 2 ? '#4f46e5' : 'var(--ct-text-muted)', fontWeight: i === 2 ? '700' : '400', fontFamily:'inherit' }}
        >
          {weeks[i]}
        </text>
      ))}
    </svg>
  );
};

/* ── stat card ── */
const StatCard = ({ icon: Icon, label, value, trend, trendPos, color, delay }) => (
  <div className={`stat-card anim-fade-up ${delay}`} style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
      <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <Trend value={trend} positive={trendPos} />
    </div>
    <div style={{ fontSize:'11px', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ct-text-muted)', marginBottom:'6px' }}>{label}</div>
    <div style={{ fontSize:'30px', fontWeight:'800', color:'var(--ct-text)', letterSpacing:'-0.03em' }}>{value}</div>
  </div>
);

/* ── recent application row ── */
const AppRow = ({ logo, title, company, date, status, color }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:'14px', padding:'14px 0',
    borderBottom:'1px solid var(--ct-border)',
  }}>
    <div className="company-avatar" style={{ background:`${color}18`, color }}>
      {logo}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--ct-text)' }}>{title}</div>
      <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'2px' }}>{company}</div>
    </div>
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
    <ChevronRight size={16} style={{ color:'var(--ct-text-muted)', flexShrink:0 }} />
  </div>
);

/* ── upcoming interview card ── */
const InterviewCard = ({ tag, tagColor, title, company, location, isToday }) => (
  <div style={{
    padding:'14px', borderRadius:'11px',
    background: isToday ? 'var(--ct-primary-light)' : 'var(--ct-bg)',
    border:`1px solid ${isToday ? 'rgba(79,70,229,0.2)' : 'var(--ct-border)'}`,
    marginBottom:'10px',
  }}>
    <div style={{ fontSize:'10px', fontWeight:'700', color: isToday ? 'var(--ct-primary)' : 'var(--ct-text-muted)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'5px', display:'flex', alignItems:'center', gap:'6px' }}>
      <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: tagColor, display:'inline-block' }} />
      {tag}
    </div>
    <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--ct-text)', marginBottom:'2px' }}>{title}</div>
    <div style={{ fontSize:'12px', color:'var(--ct-text-muted)' }}>{company}</div>
    {location && (
      <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'8px', fontSize:'11px', color:'var(--ct-text-muted)' }}>
        <MapPin size={11} />{location}
      </div>
    )}
  </div>
);

/* ── main ── */
const Dashboard = () => (
  <div className="page-enter">
    {/* Page header */}
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'26px', flexWrap:'wrap', gap:'14px' }}>
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, Siddharth. Your pipeline is looking active today.</p>
      </div>
      <div style={{ display:'flex', gap:'10px' }}>
        <button className="btn-secondary" id="download-report-btn"><FileText size={15} />Download Report</button>
        <button className="btn-primary"   id="sync-data-btn">Sync Data</button>
      </div>
    </div>

    {/* Stats row */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'16px', marginBottom:'24px' }}>
      <StatCard icon={FileText}     label="Total Applications" value="15" trend="+12%"  trendPos color="#4f46e5" delay="stagger-1" />
      <StatCard icon={MessageSquare}label="Interviews"          value="4"  trend="+25%"  trendPos color="#10b981" delay="stagger-2" />
      <StatCard icon={PartyPopper}  label="Offers"             value="2"  trend="+2"   trendPos color="#f59e0b" delay="stagger-3" />
      <StatCard icon={XCircle}      label="Rejections"         value="3"  trend="−8%"  trendPos={false} color="#ef4444" delay="stagger-4" />
    </div>

    {/* Main 2-col section */}
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'20px', marginBottom:'20px', alignItems:'start' }}>
      {/* Applications over time */}
      <div className="ct-card" style={{ padding:'22px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
          <div>
            <div className="section-title">Applications Over Time</div>
            <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'3px' }}>Activity volume for the current month</div>
          </div>
          <button className="btn-secondary" style={{ fontSize:'12px', padding:'6px 14px' }}>Last 30 Days</button>
        </div>
        <AreaChart />
      </div>

      {/* Upcoming interviews */}
      <div className="ct-card" style={{ padding:'22px' }}>
        <div className="section-title" style={{ marginBottom:'16px' }}>Upcoming Interviews</div>
        <InterviewCard
          tag="TODAY · 2:00 PM" tagColor="#4f46e5"
          title="Technical Round" company="Airbnb · Video Call"
          isToday
        />
        <InterviewCard
          tag="TOMORROW · 11:30 AM" tagColor="#f59e0b"
          title="Portfolio Review" company="Figma · On-site"
          location="San Francisco, CA"
        />
        <button className="btn-secondary" style={{ width:'100%', justifyContent:'center', marginTop:'4px', fontSize:'13px' }} id="schedule-sync-btn">
          Schedule Sync
        </button>
      </div>
    </div>

    {/* Bottom 2-col section */}
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'20px', alignItems:'start' }}>
      {/* Recent applications */}
      <div className="ct-card" style={{ padding:'22px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
          <div className="section-title">Recent Applications</div>
          <button className="btn-ghost" id="view-all-apps-btn">View All</button>
        </div>
        <AppRow logo="G" title="Senior Product Designer" company="Google · Applied 2 days ago"  status="Interviewing" color="#4f46e5" />
        <AppRow logo="S" title="Lead UI Engineer"        company="Stripe · Applied 5 days ago"  status="Applied"      color="#10b981" />
        <AppRow logo="A" title="UX Research Lead"       company="Airbnb · Applied 8 days ago"  status="Screening"    color="#f59e0b" />
      </div>

      {/* Profile strength */}
      <div style={{ background:'linear-gradient(135deg,#4f46e5 0%,#6d28d9 100%)', borderRadius:'var(--ct-radius)', padding:'22px', color:'white' }}>
        <div style={{ fontSize:'13px', fontWeight:'600', opacity:0.8, marginBottom:'8px' }}>Profile Strength</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'14px' }}>
          <span style={{ fontSize:'38px', fontWeight:'900', letterSpacing:'-0.03em' }}>82%</span>
          <span style={{ fontSize:'12px', opacity:0.7 }}>Expert Level!</span>
        </div>
        {/* Bar */}
        <div style={{ height:'7px', background:'rgba(255,255,255,0.2)', borderRadius:'4px', marginBottom:'18px', overflow:'hidden' }}>
          <div style={{ width:'82%', height:'100%', background:'#10b981', borderRadius:'4px', transition:'width 1s ease' }} />
        </div>
        {/* Items */}
        {[
          { label:'Resume SEO optimized',         done: true  },
          { label:'4 Case studies added',          done: true  },
          { label:'Missing LinkedIn certification', done: false },
        ].map((item) => (
          <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', fontSize:'12px' }}>
            {item.done
              ? <CheckCircle2 size={14} style={{ color:'#10b981', flexShrink:0 }} />
              : <Circle       size={14} style={{ color:'rgba(255,255,255,0.4)', flexShrink:0 }} />
            }
            <span style={{ opacity: item.done ? 1 : 0.6 }}>{item.label}</span>
          </div>
        ))}
        <button
          id="complete-setup-btn"
          style={{
            width:'100%', background:'white', border:'none', borderRadius:'10px',
            padding:'11px', fontWeight:'700', fontSize:'13px', color:'#4f46e5',
            cursor:'pointer', marginTop:'14px', transition:'opacity 0.2s',
          }}
          onMouseEnter={e=>e.target.style.opacity=0.9}
          onMouseLeave={e=>e.target.style.opacity=1}
        >
          Complete Setup
        </button>
      </div>
    </div>
  </div>
);

export default Dashboard;
