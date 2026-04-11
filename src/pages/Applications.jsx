import React, { useState } from 'react';
import { SlidersHorizontal, Download, Sparkles, BarChart2 } from 'lucide-react';

const applications = [
  { id:1, logo:'G', company:'Google',  title:'Senior Product Designer', location:'Mountain View, CA', date:'Oct 12, 2023', salary:'$180k – $220k', status:'Interviewing', color:'#4285f4' },
  { id:2, logo:'A', company:'Airbnb',  title:'UX Engineering Lead',     location:'Remote',            date:'Oct 14, 2023', salary:'$165k – $190k', status:'Applied',      color:'#ff5a5f' },
  { id:3, logo:'S', company:'Stripe',  title:'Design Technologist',     location:'San Francisco, CA', date:'Oct 16, 2023', salary:'$200k+',        status:'Offer Received', color:'#635bff' },
  { id:4, logo:'M', company:'Meta',    title:'Staff UI Designer',       location:'Menlo Park, CA',    date:'Oct 05, 2023', salary:'$210k – $240k', status:'Rejected',     color:'#1877f2' },
  { id:5, logo:'Sp',company:'Spotify', title:'Lead Product Designer',   location:'New York, NY',      date:'Oct 20, 2023', salary:'$175k – $210k', status:'Screening',    color:'#1db954' },
];

const statusClass = {
  'Interviewing':  'badge-interviewing',
  'Applied':       'badge-applied',
  'Offer Received':'badge-offer',
  'Rejected':      'badge-rejected',
  'Screening':     'badge-screening',
};
const statusBorder = {
  'Interviewing':  'sl-interviewing',
  'Applied':       'sl-applied',
  'Offer Received':'sl-offer',
  'Rejected':      'sl-rejected',
  'Screening':     'sl-screening',
};

/* ── mini velocity bar chart ── */
const VelocityChart = () => {
  const bars = [35, 72, 55, 80, 48, 66];
  const maxH = 80;
  return (
    <svg viewBox={`0 0 ${bars.length * 50} ${maxH + 20}`} style={{ width:'100%', maxWidth:'320px', height:'80px' }}>
      {bars.map((v, i) => {
        const h = (v / 100) * maxH;
        const x = i * 50 + 8;
        const y = maxH - h;
        return (
          <rect
            key={i} x={x} y={y} width={34} height={h}
            rx={6} fill={i === 1 || i === 3 ? '#4f46e5' : 'rgba(79,70,229,0.18)'}
          />
        );
      })}
    </svg>
  );
};

const Applications = () => {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? applications
    : applications.filter(a => a.status === filter);

  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'26px', flexWrap:'wrap', gap:'14px' }}>
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">
            You currently have{' '}
            <span style={{ color:'var(--ct-primary)', fontWeight:'700' }}>24 active</span>
            {' '}job pursuits.
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn-secondary" id="filter-btn"><SlidersHorizontal size={15} />Filters</button>
          <button className="btn-secondary" id="export-btn"><Download size={15} />Export</button>
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'18px', flexWrap:'wrap' }}>
        {['All','Interviewing','Applied','Offer Received','Rejected','Screening'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600',
              cursor:'pointer', transition:'all 0.18s',
              background: filter === s ? 'var(--ct-primary)' : 'var(--ct-card)',
              color:       filter === s ? '#fff' : 'var(--ct-text-secondary)',
              border: `1px solid ${filter === s ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="ct-card" style={{ overflow:'hidden', marginBottom:'20px' }}>
        {filtered.map((app) => (
          <div
            key={app.id}
            className={`app-row ${statusBorder[app.status]}`}
            id={`app-row-${app.id}`}
          >
            <div
              className="company-avatar"
              style={{ background:`${app.color}18`, color: app.color, fontSize:'14px' }}
            >
              {app.logo}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--ct-text)' }}>{app.title}</div>
              <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'2px' }}>
                {app.company} · {app.location}
              </div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ct-text-muted)', marginBottom:'2px' }}>Date Applied</div>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--ct-text)' }}>{app.date}</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ct-text-muted)', marginBottom:'2px' }}>Salary Range</div>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--ct-text)' }}>{app.salary}</div>
            </div>
            <span className={`badge ${statusClass[app.status]}`}>{app.status}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--ct-text-muted)' }}>
            No applications found for this status.
          </div>
        )}
      </div>

      {/* Bottom row: velocity + promo */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'20px', alignItems:'start' }}>
        {/* Velocity chart */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div className="section-title">Application Velocity</div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'var(--ct-primary)', fontWeight:'600' }}>
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--ct-primary)', display:'inline-block' }} />
              Submissions
            </div>
          </div>
          <VelocityChart />
        </div>

        {/* Promo card */}
        <div className="promo-card" style={{ width:'260px', flexShrink:0 }}>
          <div style={{ position:'relative', zIndex:1 }}>
            <Sparkles size={22} style={{ color:'rgba(255,255,255,0.8)', marginBottom:'10px' }} />
            <div style={{ fontWeight:'800', fontSize:'17px', marginBottom:'6px', lineHeight:'1.3' }}>
              Your Profile is trending!
            </div>
            <p style={{ fontSize:'12px', opacity:0.75, lineHeight:'1.6', marginBottom:'16px' }}>
              3 recruiters from top companies viewed your portfolio this week.
            </p>
            <button
              id="view-analytics-btn"
              style={{
                width:'100%', background:'white', border:'none', borderRadius:'9px',
                padding:'10px', fontWeight:'700', fontSize:'12px', color:'#4f46e5',
                cursor:'pointer', letterSpacing:'0.04em', textTransform:'uppercase',
              }}
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
