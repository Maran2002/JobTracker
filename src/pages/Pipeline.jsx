import React from 'react';
import { SlidersHorizontal, MoreHorizontal, Clock, Plus } from 'lucide-react';

const columns = [
  {
    id: 'applied', label: 'Applied', count: 12, accentColor: '#4f46e5',
    cards: [
      { id:1, tag:'Product',    tagClass:'badge-tag',        title:'Senior Product Designer', company:'Linear',        detail:'$160k – $190k',  info:'Applied 2d ago',   infoIcon:'clock' },
      { id:2, tag:'Design',     tagClass:'badge-tag-design', title:'Visual Identity Lead',   company:'Stripe · Remote', detail:'Applied 2d ago', info:'',                 infoIcon:'clock' },
    ],
  },
  {
    id: 'screening', label: 'Screening', count: 4, accentColor: '#10b981',
    cards: [
      { id:3, tag:'Engineering',tagClass:'badge-tag-eng',  title:'Founding UI Engineer', company:'Perplexity AI', detail:'$180k+', info:'', infoIcon:'', badge:'Recruiter Screen', badgeTmr:true },
    ],
  },
  {
    id: 'interview', label: 'Interview', count: 3, accentColor: '#6366f1',
    cards: [
      { id:4, tag:'Product Design',tagClass:'badge-tag-design', title:'UX Research Lead', company:'Airbnb · SF', detail:'Round 3: Portfolio Review', info:'', infoIcon:'', badge:'Oct 24, 2:10 PM', badgeTeal:true },
    ],
  },
  {
    id: 'offer', label: 'Offer', count: 1, accentColor: '#f59e0b',
    cards: [
      { id:5, tag:'Management', tagClass:'badge-tag-mgmt', title:'Design Manager', company:'Vercel · Full-time', detail:'$215k Salary · 0.15% Equity', info:'Decision by Fri', infoIcon:'', orange:true },
    ],
  },
  {
    id: 'rejected', label: 'Rejected', count: 1, accentColor: '#ef4444',
    cards: [
      { id:6, tag:'Product', tagClass:'badge-tag', title:'Director of Product', company:'Meta · Hybrid', detail:'Post-interview', info:'', infoIcon:'', rejected:true },
    ],
  },
];

const KanbanCard = ({ card }) => (
  <div className="kanban-card" id={`card-${card.id}`}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2px' }}>
      <span className={`badge ${card.tagClass}`}>{card.tag}</span>
      <button style={{ background:'none', border:'none', color:'var(--ct-text-muted)', cursor:'pointer', padding:'2px' }}>
        <MoreHorizontal size={14} />
      </button>
    </div>
    <div className="kanban-card-title">{card.title}</div>
    <div className="kanban-card-sub">{card.company}</div>

    {card.detail && (
      <div style={{
        fontSize:'11px', fontWeight:'600', color: card.orange ? 'var(--ct-warning)' : 'var(--ct-text-muted)',
        marginBottom:'8px', background: card.orange ? 'var(--ct-warning-light)' : 'transparent',
        padding: card.orange ? '4px 8px' : '0', borderRadius:'6px', display:'inline-block',
      }}>
        {card.detail}
      </div>
    )}

    {card.badge && (
      <div style={{
        fontSize:'11px', fontWeight:'600', color: card.badgeTmr ? 'var(--ct-warning)' : card.badgeTeal ? 'var(--ct-teal)' : 'var(--ct-text-muted)',
        background: card.badgeTmr ? 'var(--ct-warning-light)' : card.badgeTeal ? 'rgba(20,184,166,0.1)' : 'transparent',
        padding:'3px 8px', borderRadius:'6px', display:'inline-block', marginBottom:'8px',
      }}>
        {card.badge}
      </div>
    )}

    {card.info && (
      <div className="kanban-card-footer">
        {card.infoIcon === 'clock' && <Clock size={11} />}
        {card.info}
      </div>
    )}

    {card.rejected && (
      <div style={{ fontSize:'11px', color:'var(--ct-danger)', fontWeight:'600', background:'var(--ct-danger-light)', padding:'3px 8px', borderRadius:'6px', display:'inline-block' }}>
        Post-interview
      </div>
    )}
  </div>
);

const Pipeline = () => (
  <div className="page-enter">
    {/* Header */}
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'6px', fontSize:'12px', color:'var(--ct-text-muted)' }}>
      <span>Recruitment</span>
      <span>›</span>
      <span style={{ color:'var(--ct-primary)', fontWeight:'600' }}>Pipeline Kanban</span>
    </div>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px' }}>
      <h1 className="page-title">Application Pipeline</h1>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        {/* Avatar stack */}
        <div style={{ display:'flex' }}>
          {['#4f46e5','#10b981','#f59e0b'].map((c,i) => (
            <div key={i} style={{
              width:'28px', height:'28px', borderRadius:'50%', background:c,
              border:'2px solid var(--ct-card)', marginLeft: i ? '-8px' : '0',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontSize:'11px', fontWeight:'700',
            }}>
              {String.fromCharCode(65+i)}
            </div>
          ))}
          <div style={{
            width:'28px', height:'28px', borderRadius:'50%',
            background:'var(--ct-bg)', border:'2px solid var(--ct-border)',
            marginLeft:'-8px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'10px', fontWeight:'700', color:'var(--ct-text-muted)',
          }}>+3</div>
        </div>
        <button className="btn-secondary" id="pipeline-filter-btn"><SlidersHorizontal size={14} />Filters</button>
      </div>
    </div>

    {/* Kanban board */}
    <div className="kanban-board">
      {columns.map((col) => (
        <div key={col.id} className="kanban-col" id={`kanban-${col.id}`}>
          {/* Column header */}
          <div className="kanban-col-header">
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:col.accentColor }} />
              <span className="kanban-col-title">{col.label}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{
                minWidth:'20px', height:'20px', borderRadius:'10px',
                background:`${col.accentColor}20`, color:col.accentColor,
                fontSize:'11px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center',
                padding:'0 6px',
              }}>{col.count}</span>
              <button style={{ background:'none', border:'none', color:'var(--ct-text-muted)', cursor:'pointer', padding:'2px' }}>
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Cards */}
          {col.cards.map((card) => <KanbanCard key={card.id} card={card} />)}

          {/* Add card button */}
          <button
            style={{
              width:'100%', background:'none', border:'1px dashed var(--ct-border)',
              borderRadius:'9px', padding:'9px', color:'var(--ct-text-muted)',
              fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center',
              justifyContent:'center', gap:'6px', transition:'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ct-primary)'; e.currentTarget.style.color='var(--ct-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--ct-border)';  e.currentTarget.style.color='var(--ct-text-muted)'; }}
          >
            <Plus size={13} /> Add card
          </button>
        </div>
      ))}
    </div>

    {/* FAB */}
    <button className="fab" aria-label="Add new application" id="pipeline-fab">
      <Plus size={22} />
    </button>
  </div>
);

export default Pipeline;
