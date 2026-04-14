import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Download, Plus, X, Eye, Edit2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/gateway';
import FilterDrawer from '../components/FilterDrawer';
import { formatSalary } from '../utils/formatSalary';

const statusClass = {
  'Interviewing':   'badge-interviewing',
  'Applied':        'badge-applied',
  'Offer Received': 'badge-offer',
  'Rejected':       'badge-rejected',
  'Screening':      'badge-screening',
};
const statusBorder = {
  'Interviewing':   'sl-interviewing',
  'Applied':        'sl-applied',
  'Offer Received': 'sl-offer',
  'Rejected':       'sl-rejected',
  'Screening':      'sl-screening',
};

/* ── Filter config ───────────────────────────── */
const APPLICATIONS_FILTER_CONFIG = [
  {
    key: 'priority',
    label: 'Priority',
    type: 'multiselect',
    options: ['High', 'Medium', 'Low'],
  },
  {
    key: 'jobType',
    label: 'Job Type',
    type: 'multiselect',
    options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
  },
  {
    key: 'workMode',
    label: 'Work Mode',
    type: 'multiselect',
    options: ['On-site', 'Remote', 'Hybrid'],
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'e.g. New York, Remote…',
  },
  {
    key: 'dateFrom',
    label: 'Applied After',
    type: 'date',
  },
  {
    key: 'dateTo',
    label: 'Applied Before',
    type: 'date',
  },
];

const DEFAULT_FILTERS = {
  priority: [],
  jobType:  [],
  workMode: [],
  location: '',
  dateFrom: '',
  dateTo:   '',
};

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

/* ── FilterChip (inline removable tag) ── */
const FilterChip = ({ label, color, onRemove }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px 3px 11px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
    background: color ? `${color}18` : 'var(--ct-primary-light)',
    color: color || 'var(--ct-primary)',
    border: `1px solid ${color ? `${color}30` : 'rgba(79,70,229,0.18)'}`,
  }}>
    {label}
    <button onClick={onRemove} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '0',
      color: 'inherit', opacity: 0.7, display: 'flex', alignItems: 'center', lineHeight: 1,
    }}>
      <X size={10} />
    </button>
  </span>
);

/* ── XLSX export ── */
const exportToXLSX = (applications) => {
  const rows = applications.map((app) => ({
    'Job Title':    app.title,
    'Company':      app.company,
    'Location':     app.location,
    'Status':       app.status,
    'Priority':     app.priority || '',
    'Job Type':     app.jobType  || '',
    'Work Mode':    app.workMode || '',
    'Salary':       formatSalary(app.salary, app.currency),
    'Date Applied': app.dateApplied
      ? new Date(app.dateApplied).toLocaleDateString('en-GB')
      : '',
    'Deadline': app.deadline
      ? new Date(app.deadline).toLocaleDateString('en-GB')
      : '',
    'Source':    app.source   || '',
    'Job URL':   app.jobUrl   || '',
    'HR Name':   app.hrName   || '',
    'HR Email':  app.hrEmail  || '',
    'Skills':    app.skills   || '',
    'Notes':     app.notes    || '',
  }));

  const worksheet  = XLSX.utils.json_to_sheet(rows);
  const workbook   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

  /* auto column widths */
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] || '').length)) + 2,
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `CareerTrack_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/* ══════════ Applications Page ═══════════ */
const Applications = () => {
  const navigate = useNavigate();
  const [applications,     setApplications]     = useState([]);
  const [statusFilter,     setStatusFilter]      = useState('All');
  const [loading,          setLoading]           = useState(true);
  const [filterOpen,       setFilterOpen]        = useState(false);
  const [pendingFilters,   setPendingFilters]    = useState(DEFAULT_FILTERS);
  const [appliedFilters,   setAppliedFilters]    = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get('/applications');
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  /* ── active (non-rejected) count ── */
  const activeCount = useMemo(
    () => applications.filter((a) => a.status !== 'Rejected').length,
    [applications]
  );

  /* ── drawer filter count ── */
  const drawerFilterCount = useMemo(
    () => Object.values(appliedFilters).filter((v) =>
      Array.isArray(v) ? v.length > 0 : v !== '' && v != null
    ).length,
    [appliedFilters]
  );

  /* ── combined filter logic ── */
  const filtered = useMemo(() => {
    const { priority, jobType, workMode, location, dateFrom, dateTo } = appliedFilters;
    const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const dateToMs   = dateTo   ? new Date(dateTo).getTime()   : null;

    return applications.filter((app) => {
      /* status chip */
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;

      /* drawer filters */
      if (priority.length && !priority.includes(app.priority)) return false;
      if (jobType.length  && !jobType.includes(app.jobType))   return false;
      if (workMode.length && !workMode.includes(app.workMode)) return false;
      if (location && !app.location?.toLowerCase().includes(location.toLowerCase())) return false;
      if (dateFromMs) {
        const d = app.dateApplied ? new Date(app.dateApplied).getTime() : null;
        if (!d || d < dateFromMs) return false;
      }
      if (dateToMs) {
        const d = app.dateApplied ? new Date(app.dateApplied).getTime() : null;
        if (!d || d > dateToMs) return false;
      }
      return true;
    });
  }, [applications, statusFilter, appliedFilters]);

  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'26px', flexWrap:'wrap', gap:'14px' }}>
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">
            You currently have{' '}
            <span style={{ color:'var(--ct-primary)', fontWeight:'700' }}>
              {loading ? '…' : activeCount} active
            </span>
            {' '}job pursuit{activeCount !== 1 ? 's' : ''}.
          </p>
        </div>

        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          {/* Filter button */}
          <button
            className="btn-secondary"
            id="filter-btn"
            style={{ position:'relative' }}
            onClick={() => { setPendingFilters(appliedFilters); setFilterOpen(true); }}
          >
            <SlidersHorizontal size={15} /> Filters
            {drawerFilterCount > 0 && (
              <span style={{
                position:'absolute', top:'-6px', right:'-6px',
                background:'var(--ct-primary)', color:'#fff',
                fontSize:'9px', fontWeight:'700',
                borderRadius:'10px', padding:'2px 6px', lineHeight:1.4,
              }}>
                {drawerFilterCount}
              </span>
            )}
          </button>

          {/* Export button */}
          <button
            className="btn-secondary"
            id="export-btn"
            onClick={() => exportToXLSX(filtered)}
            disabled={filtered.length === 0}
            title={filtered.length === 0 ? 'No applications to export' : `Export ${filtered.length} application${filtered.length !== 1 ? 's' : ''} to XLSX`}
          >
            <Download size={15} /> Export
          </button>

          <button
            className="btn-primary"
            id="add-application-btn"
            onClick={() => navigate('/applications/new')}
          >
            <Plus size={15} /> New Application
          </button>
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'14px', flexWrap:'wrap' }}>
        {['All', 'Interviewing', 'Applied', 'Offer Received', 'Rejected', 'Screening'].map((s) => {
          const count = s === 'All'
            ? applications.length
            : applications.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600',
                cursor:'pointer', transition:'all 0.18s', display:'flex', alignItems:'center', gap:'6px',
                background: statusFilter === s ? 'var(--ct-primary)' : 'var(--ct-card)',
                color:       statusFilter === s ? '#fff' : 'var(--ct-text-secondary)',
                border: `1px solid ${statusFilter === s ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
              }}
            >
              {s}
              <span style={{
                fontSize:'10px', fontWeight:'700',
                background: statusFilter === s ? 'rgba(255,255,255,0.25)' : 'var(--ct-bg-secondary)',
                borderRadius:'10px', padding:'1px 6px',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active drawer filter chips */}
      {drawerFilterCount > 0 && (
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'8px', marginBottom:'14px' }}>
          <span style={{ fontSize:'11px', fontWeight:'700', color:'var(--ct-text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
            Filters:
          </span>
          {appliedFilters.priority.map((v) => (
            <FilterChip key={`p-${v}`} label={v} color={PRIORITY_COLORS[v]}
              onRemove={() => setAppliedFilters((prev) => ({ ...prev, priority: prev.priority.filter((x) => x !== v) }))} />
          ))}
          {appliedFilters.jobType.map((v) => (
            <FilterChip key={`jt-${v}`} label={v}
              onRemove={() => setAppliedFilters((prev) => ({ ...prev, jobType: prev.jobType.filter((x) => x !== v) }))} />
          ))}
          {appliedFilters.workMode.map((v) => (
            <FilterChip key={`wm-${v}`} label={v}
              onRemove={() => setAppliedFilters((prev) => ({ ...prev, workMode: prev.workMode.filter((x) => x !== v) }))} />
          ))}
          {appliedFilters.location && (
            <FilterChip label={`Location: ${appliedFilters.location}`}
              onRemove={() => setAppliedFilters((prev) => ({ ...prev, location: '' }))} />
          )}
          {appliedFilters.dateFrom && (
            <FilterChip label={`From: ${appliedFilters.dateFrom}`}
              onRemove={() => setAppliedFilters((prev) => ({ ...prev, dateFrom: '' }))} />
          )}
          {appliedFilters.dateTo && (
            <FilterChip label={`To: ${appliedFilters.dateTo}`}
              onRemove={() => setAppliedFilters((prev) => ({ ...prev, dateTo: '' }))} />
          )}
          <button
            onClick={() => { setAppliedFilters(DEFAULT_FILTERS); setPendingFilters(DEFAULT_FILTERS); }}
            style={{
              background:'none', border:'none', cursor:'pointer',
              fontSize:'11px', fontWeight:'700', color:'var(--ct-danger)',
              padding:'3px 8px', borderRadius:'6px', transition:'background 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ct-danger-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Applications list */}
      <div className="ct-card" style={{ overflow:'hidden', marginBottom:'20px' }}>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--ct-text-muted)', fontSize:'14px' }}>
            Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--ct-text-muted)' }}>
            No applications match the current filters.
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app._id}
              className={`app-row ${statusBorder[app.status]}`}
              id={`app-row-${app._id}`}
            >
              {/* Avatar */}
              <div
                className="company-avatar"
                style={{ background:`${app.color || '#4f46e5'}18`, color: app.color || '#4f46e5', fontSize:'14px' }}
              >
                {app.logo || app.company?.slice(0, 2).toUpperCase()}
              </div>

              {/* Title + company */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--ct-text)' }}>{app.title}</div>
                <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'2px' }}>
                  {app.company} · {app.location}
                </div>
              </div>

              {/* Date applied */}
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ct-text-muted)', marginBottom:'2px' }}>
                  Date Applied
                </div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--ct-text)' }}>
                  {app.dateApplied
                    ? new Date(app.dateApplied).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
                    : '—'}
                </div>
              </div>

              {/* Salary */}
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ct-text-muted)', marginBottom:'2px' }}>
                  Salary
                </div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--ct-text)' }}>
                  {formatSalary(app.salary, app.currency)}
                </div>
              </div>

              {/* Status badge */}
              <span className={`badge ${statusClass[app.status]}`} style={{minWidth: "100px"}}>{app.status}</span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app._id}`); }}
                  style={{ background: 'var(--ct-bg-secondary)', border: '1px solid var(--ct-border)', borderRadius: '6px', padding: '6px', color: 'var(--ct-text-secondary)', cursor: 'pointer' }}
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/applications/edit/${app._id}`, { state: { application: app } }); }}
                  style={{ background: 'var(--ct-bg-secondary)', border: '1px solid var(--ct-border)', borderRadius: '6px', padding: '6px', color: 'var(--ct-text-secondary)', cursor: 'pointer' }}
                  title="Edit Application"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        onChange={setPendingFilters}
        onApply={(f) => setAppliedFilters(f)}
        onReset={() => setPendingFilters(DEFAULT_FILTERS)}
        config={APPLICATIONS_FILTER_CONFIG}
        title="Application Filters"
      />
    </div>
  );
};

export default Applications;
