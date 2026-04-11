import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Link2, MoreVertical, Map, Video } from 'lucide-react';

const interviews = [
  {
    id:1, color:'#4f46e5', logo:'G',  logoColor:'#4285f4',
    title:'Product Designer',   company:'Google',  location:'San Francisco, CA',
    date:'May 24, 2024', time:'10:30 AM – 11:30 AM', venue:'Google Meet',
    type:'VIDEO CALL', typeClass:'badge-video',
  },
  {
    id:2, color:'#f59e0b', logo:'Fk', logoColor:'#047857',
    title:'Senior UX Designer', company:'Flipkart', location:'Bengaluru, KA',
    date:'May 26, 2024', time:'02:00 PM – 04:00 PM', venue:'Main Office, Block B',
    type:'ON-SITE', typeClass:'badge-onsite',
  },
  {
    id:3, color:'#ef4444', logo:'Z', logoColor:'#e11d48',
    title:'Product Manager',    company:'Zomato',   location:'Gurugram, HR',
    date:'May 28, 2024', time:'11:00 AM – 12:00 PM', venue:'Zoom Link Provided',
    type:'VIDEO CALL', typeClass:'badge-video',
  },
  {
    id:4, color:'#10b981', logo:'My', logoColor:'#db2777',
    title:'Visual Designer',    company:'Myntra',   location:'Remote',
    date:'June 02, 2024', time:'03:30 PM – 04:30 PM', venue:'Google Meet',
    type:'VIDEO CALL', typeClass:'badge-video',
  },
];

const InterviewRow = ({ itv }) => (
  <div className="timeline-item" id={`interview-${itv.id}`}>
    {/* Left color bar */}
    <div className="timeline-left-bar" style={{ background: itv.color }} />

    {/* Company logo */}
    <div
      className="company-avatar"
      style={{ background:`${itv.logoColor}18`, color:itv.logoColor, fontSize:'13px' }}
    >
      {itv.logo}
    </div>

    {/* Info */}
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontWeight:'700', fontSize:'15px', color:'var(--ct-text)', marginBottom:'2px' }}>{itv.title}</div>
      <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginBottom:'9px' }}>
        {itv.company} · {itv.location}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'14px', fontSize:'12px', color:'var(--ct-text-muted)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><Calendar size={12} />{itv.date}</span>
        <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><Clock    size={12} />{itv.time}</span>
        <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><MapPin   size={12} />{itv.venue}</span>
      </div>
    </div>

    {/* Type badge */}
    <span className={`badge ${itv.typeClass}`} style={{ flexShrink:0 }}>{itv.type}</span>

    {/* Actions */}
    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
      <button className="icon-btn" aria-label="Join link"><Link2 size={14} /></button>
      <button className="icon-btn" aria-label="Options"><MoreVertical size={14} /></button>
    </div>
  </div>
);

const Schedule = () => {
  const [view, setView] = useState('list');

  return (
    <div className="page-enter">
      {/* Top stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:'16px', marginBottom:'26px' }}>
        {/* Upcoming */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ct-text-muted)', marginBottom:'8px' }}>Upcoming</div>
          <div style={{ fontSize:'36px', fontWeight:'900', color:'var(--ct-text)', letterSpacing:'-0.03em', lineHeight:1 }}>08</div>
          <div style={{ fontSize:'13px', color:'var(--ct-text-muted)', marginTop:'4px' }}>Interviews</div>
        </div>

        {/* This week */}
        <div className="ct-card" style={{ padding:'22px' }}>
          <div style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ct-text-muted)', marginBottom:'8px' }}>This Week</div>
          <div style={{ fontSize:'36px', fontWeight:'900', color:'var(--ct-text)', letterSpacing:'-0.03em', lineHeight:1 }}>03</div>
          <div style={{ fontSize:'13px', color:'var(--ct-text-muted)', marginTop:'4px' }}>Scheduled</div>
        </div>

        {/* Featured interview banner */}
        <div style={{
          background:'linear-gradient(135deg,#4f46e5,#6d28d9)',
          borderRadius:'var(--ct-radius)', padding:'22px 24px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          color:'white', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', width:'180px', height:'180px', background:'rgba(255,255,255,0.06)', borderRadius:'50%', top:'-60px', right:'-40px' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontWeight:'800', fontSize:'17px', marginBottom:'4px' }}>Product Design Interview</div>
            <div style={{ fontSize:'13px', opacity:0.75 }}>With Google Design Team · 14:00 PM</div>
          </div>
          <button
            id="prepare-now-btn"
            style={{
              background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)',
              borderRadius:'9px', padding:'9px 18px', color:'white',
              fontWeight:'700', fontSize:'13px', cursor:'pointer',
              transition:'background 0.2s', whiteSpace:'nowrap', position:'relative', zIndex:1,
            }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
          >
            Prepare Now
          </button>
        </div>
      </div>

      {/* Timeline header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
          <Calendar size={18} style={{ color:'var(--ct-primary)' }} />
          <span className="section-title">Detailed Interview Timeline</span>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {[{id:'list',label:'List View'},{id:'calendar',label:'Calendar'}].map(v => (
            <button
              key={v.id}
              id={`view-${v.id}`}
              onClick={() => setView(v.id)}
              style={{
                padding:'7px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:'600',
                cursor:'pointer', transition:'all 0.18s',
                background: view === v.id ? 'var(--ct-primary)' : 'var(--ct-card)',
                color:       view === v.id ? '#fff' : 'var(--ct-text-secondary)',
                border: `1px solid ${view === v.id ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interview list */}
      {view === 'list' && (
        <div style={{ marginBottom:'22px' }}>
          {interviews.map(itv => <InterviewRow key={itv.id} itv={itv} />)}
        </div>
      )}

      {/* Calendar placeholder */}
      {view === 'calendar' && (
        <div className="ct-card" style={{ padding:'60px', textAlign:'center', marginBottom:'22px', color:'var(--ct-text-muted)' }}>
          <Calendar size={48} style={{ margin:'0 auto 14px', opacity:0.3 }} />
          <div style={{ fontWeight:'700', fontSize:'16px', color:'var(--ct-text)', marginBottom:'6px' }}>Calendar View</div>
          <div style={{ fontSize:'13px' }}>Full calendar integration coming soon.</div>
        </div>
      )}

      {/* Bottom cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Daily tip */}
        <div className="ct-card" style={{ padding:'24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:'-20px', bottom:'-20px', opacity:0.06 }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="var(--ct-text)">
              <path d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7S5 12.87 5 9a7 7 0 0 1 7-7zm0 16c.83 0 1.5-.67 1.5-1.5S12.83 15 12 15s-1.5.67-1.5 1.5S11.17 18 12 18zm5.5-9A5.5 5.5 0 0 0 12 3.5 5.5 5.5 0 0 0 6.5 9H8a4 4 0 0 1 8 0h1.5z" />
            </svg>
          </div>
          <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em', color:'var(--ct-primary)', textTransform:'uppercase', marginBottom:'10px' }}>
            Daily Preparation Tip
          </div>
          <p style={{ fontSize:'14px', color:'var(--ct-text)', lineHeight:'1.65', marginBottom:'18px', position:'relative', zIndex:1 }}>
            Research the interviewer's background on LinkedIn. Knowing their recent projects or publications can help you ask more engaging questions and build a stronger rapport.
          </p>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn-primary" id="read-guide-btn" style={{ fontSize:'12px' }}>Read Full Guide</button>
            <button className="btn-ghost"   id="dismiss-tip-btn" style={{ fontSize:'12px' }}>Dismiss</button>
          </div>
        </div>

        {/* Pro feature: Automated Reminders */}
        <div className="ct-card" style={{ padding:'24px' }}>
          <div style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'0.1em', color:'var(--ct-primary)', textTransform:'uppercase', marginBottom:'12px', border:'1px solid var(--ct-primary-light)', borderRadius:'6px', display:'inline-block', padding:'3px 10px' }}>
            Pro Feature
          </div>
          <div className="section-title" style={{ marginBottom:'8px' }}>Automated Reminders</div>
          <p style={{ fontSize:'13px', color:'var(--ct-text-muted)', lineHeight:'1.65', marginBottom:'18px' }}>
            Sync your Google Calendar to receive SMS alerts 15 minutes before any interview.
          </p>
          <button className="btn-secondary" id="enable-sync-btn" style={{ width:'100%', justifyContent:'center' }}>
            Enable Sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
