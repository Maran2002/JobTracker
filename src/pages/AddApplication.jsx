import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, MapPin, DollarSign, Briefcase, Link2,
  FileText, CalendarDays, Star, ChevronLeft, CheckCircle2,
  Globe, Users, Tag, Layers, Send, Loader2, Sparkles,
} from 'lucide-react';
import api from '../api/gateway';
import { toast } from 'vibe-toast';

/* ── helpers ── */
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];
const SOURCES = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Glassdoor', 'AngelList', 'Naukri', 'Other'];
const STATUSES = ['Applied', 'Screening', 'Interviewing', 'Offer Received', 'Rejected'];
const PRIORITY = ['High', 'Medium', 'Low'];
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const STEPS = [
  { id: 1, label: 'Company',   icon: Building2 },
  { id: 2, label: 'Role',      icon: Briefcase  },
  { id: 3, label: 'Details',   icon: FileText   },
  { id: 4, label: 'Review',    icon: CheckCircle2 },
];

const initForm = {
  company: '', title: '', location: '', workMode: 'On-site',
  jobType: 'Full-time', salary: '', currency: 'INR',
  status: 'Applied', source: 'LinkedIn', jobUrl: '',
  dateApplied: new Date().toISOString().slice(0, 10),
  deadline: '', priority: 'Medium', logo: '', color: '#4f46e5',
  description: '', notes: '', skills: '', hrName: '', hrEmail: '',
};

/* ── sub-components ── */
const FieldGroup = ({ label, icon: Icon, required, children, hint }) => (
  <div className="form-group" style={{ marginBottom: '20px' }}>
    <label className="ct-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {Icon && <Icon size={13} style={{ color: 'var(--ct-primary)', opacity: 0.8 }} />}
      {label}
      {required && <span style={{ color: 'var(--ct-danger)', marginLeft: '2px' }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: '11px', color: 'var(--ct-text-muted)', marginTop: '5px' }}>{hint}</p>}
  </div>
);

const SelectPill = ({ options, value, onChange, name }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
    {options.map(opt => (
      <button
        key={opt} type="button"
        onClick={() => onChange({ target: { name, value: opt } })}
        style={{
          padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', transition: 'all 0.18s',
          background: value === opt ? 'var(--ct-primary)' : 'var(--ct-card)',
          color:      value === opt ? '#fff'             : 'var(--ct-text-secondary)',
          border:     `1.5px solid ${value === opt ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
          boxShadow:  value === opt ? '0 4px 12px rgba(79,70,229,0.28)' : 'none',
        }}
      >
        {opt}
      </button>
    ))}
  </div>
);

/* ── page component ── */
const AddApplication = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const defaultStatus = location.state?.defaultStatus || 'Applied';

  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({ ...initForm, status: defaultStatus });
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const autoLogo = () => {
    const initials = form.company.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    setForm(p => ({ ...p, logo: initials || 'C' }));
  };

  const handleSubmit = async () => {
    if (!form.company || !form.title || !form.location) {
      toast.error('Company, Job Title and Location are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/applications', {
        ...form,
        logo: form.logo || form.company.slice(0, 2).toUpperCase(),
        skills: form.skills,
      });
      toast.success('Application added successfully! 🎉');
      navigate('/applications');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create application.');
    } finally {
      setSaving(false);
    }
  };

  /* ───────────── Step panels ───────────── */
  const StepCompany = () => (
    <div className="anim-fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldGroup label="Company Name" icon={Building2} required>
            <input
              className="ct-input" name="company" placeholder="e.g. Google, Meta, Stripe…"
              value={form.company} onChange={set} onBlur={autoLogo}
            />
          </FieldGroup>
        </div>

        {/* Color picker */}
        <FieldGroup label="Brand Color">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {COLORS.map(c => (
              <button
                key={c} type="button"
                onClick={() => setForm(p => ({ ...p, color: c }))}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: c,
                  border: form.color === c ? '3px solid var(--ct-text)' : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.18s', transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
            <input
              type="color" value={form.color}
              onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none' }}
              title="Custom color"
            />
          </div>
        </FieldGroup>

        {/* Logo initials */}
        <FieldGroup label="Logo Initials" hint="Auto-filled from company name. 1–3 characters.">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
              background: `${form.color}22`, color: form.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '16px', letterSpacing: '-0.02em',
            }}>
              {form.logo || '?'}
            </div>
            <input
              className="ct-input" name="logo" maxLength={3}
              placeholder="e.g. G, GO, META"
              value={form.logo} onChange={set}
            />
          </div>
        </FieldGroup>

        <div style={{ gridColumn: '1 / -1' }}>
          <FieldGroup label="HR / Recruiter Name" icon={Users}>
            <input className="ct-input" name="hrName" placeholder="John Doe (optional)" value={form.hrName} onChange={set} />
          </FieldGroup>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <FieldGroup label="HR / Recruiter Email" icon={Users}>
            <input className="ct-input" type="email" name="hrEmail" placeholder="hr@company.com (optional)" value={form.hrEmail} onChange={set} />
          </FieldGroup>
        </div>
      </div>
    </div>
  );

  const StepRole = () => (
    <div className="anim-fade-up">
      <FieldGroup label="Job Title" icon={Briefcase} required>
        <input className="ct-input" name="title" placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={set} />
      </FieldGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <FieldGroup label="Location" icon={MapPin} required>
          <input className="ct-input" name="location" placeholder="e.g. Bangalore, IN" value={form.location} onChange={set} />
        </FieldGroup>
        <FieldGroup label="Work Mode" icon={Globe}>
          <SelectPill options={WORK_MODES} value={form.workMode} onChange={set} name="workMode" />
        </FieldGroup>
      </div>

      <FieldGroup label="Job Type" icon={Layers}>
        <SelectPill options={JOB_TYPES} value={form.jobType} onChange={set} name="jobType" />
      </FieldGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '18px' }}>
        <FieldGroup label="Salary / CTC" icon={DollarSign} hint="Annual package, e.g. $120k or ₹18 LPA">
          <input className="ct-input" name="salary" placeholder="e.g. $95,000 – $130,000" value={form.salary} onChange={set} />
        </FieldGroup>
        <FieldGroup label="Currency">
          <select className="ct-input" name="currency" value={form.currency} onChange={set}>
            {['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AED'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FieldGroup>
      </div>

      <FieldGroup label="Job Posting URL" icon={Link2} hint="Direct link to the job posting">
        <input className="ct-input" type="url" name="jobUrl" placeholder="https://jobs.company.com/role/1234" value={form.jobUrl} onChange={set} />
      </FieldGroup>
    </div>
  );

  const StepDetails = () => (
    <div className="anim-fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <FieldGroup label="Initial Status" icon={Tag}>
          <SelectPill options={STATUSES} value={form.status} onChange={set} name="status" />
        </FieldGroup>
        <FieldGroup label="Priority">
          <div style={{ display: 'flex', gap: '8px' }}>
            {PRIORITY.map(p => {
              const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
              const isActive = form.priority === p;
              return (
                <button
                  key={p} type="button"
                  onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                  style={{
                    padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    cursor: 'pointer', transition: 'all 0.18s',
                    background: isActive ? `${colors[p]}20` : 'var(--ct-card)',
                    color:      isActive ? colors[p] : 'var(--ct-text-muted)',
                    border:     `1.5px solid ${isActive ? colors[p] : 'var(--ct-border)'}`,
                  }}
                >{p}</button>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup label="Date Applied" icon={CalendarDays}>
          <input className="ct-input" type="date" name="dateApplied" value={form.dateApplied} onChange={set} />
        </FieldGroup>
        <FieldGroup label="Application Deadline" icon={CalendarDays}>
          <input className="ct-input" type="date" name="deadline" value={form.deadline} onChange={set} />
        </FieldGroup>
      </div>

      <FieldGroup label="How did you find this job?" icon={Star}>
        <SelectPill options={SOURCES} value={form.source} onChange={set} name="source" />
      </FieldGroup>

      <FieldGroup label="Required Skills / Tech Stack" icon={Sparkles} hint="Comma-separated, e.g. React, TypeScript, Node.js">
        <input className="ct-input" name="skills" placeholder="React, Node.js, PostgreSQL, Docker…" value={form.skills} onChange={set} />
      </FieldGroup>

      <FieldGroup label="Job Description Summary">
        <textarea
          className="ct-input" name="description" rows={4}
          placeholder="Paste key responsibilities, requirements, or important notes from the JD…"
          value={form.description} onChange={set}
          style={{ resize: 'vertical', minHeight: '100px' }}
        />
      </FieldGroup>

      <FieldGroup label="Personal Notes">
        <textarea
          className="ct-input" name="notes" rows={3}
          placeholder="Why this role excites you, referral contacts, prep notes…"
          value={form.notes} onChange={set}
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
      </FieldGroup>
    </div>
  );

  const StepReview = () => {
    const fields = [
      { l: 'Company',      v: form.company    },
      { l: 'Job Title',    v: form.title      },
      { l: 'Location',     v: `${form.location} · ${form.workMode}` },
      { l: 'Job Type',     v: form.jobType    },
      { l: 'Salary',       v: form.salary ? `${form.salary} ${form.currency}` : '—' },
      { l: 'Status',       v: form.status     },
      { l: 'Priority',     v: form.priority   },
      { l: 'Date Applied', v: form.dateApplied },
      { l: 'Deadline',     v: form.deadline || '—' },
      { l: 'Source',       v: form.source     },
      { l: 'Job URL',      v: form.jobUrl     || '—' },
      { l: 'HR Contact',   v: form.hrName ? `${form.hrName}${form.hrEmail ? ` <${form.hrEmail}>` : ''}` : '—' },
      { l: 'Skills',       v: form.skills     || '—' },
    ];
    return (
      <div className="anim-fade-up">
        {/* preview card */}
        <div style={{
          background: `linear-gradient(135deg, ${form.color}14, ${form.color}06)`,
          border: `1.5px solid ${form.color}30`,
          borderRadius: '16px', padding: '20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '18px',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
            background: `${form.color}22`, color: form.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '20px',
          }}>
            {form.logo || form.company.slice(0, 2).toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--ct-text)' }}>{form.title || 'Job Title'}</div>
            <div style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', marginTop: '3px' }}>
              {form.company || 'Company'} · {form.location || 'Location'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
              background: `${form.color}20`, color: form.color, border: `1px solid ${form.color}40`,
            }}>{form.status}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {fields.map(({ l, v }) => (
            <div key={l} style={{
              background: 'var(--ct-bg-secondary)', borderRadius: '10px',
              padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '3px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)' }}>{l}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ct-text)', wordBreak: 'break-word' }}>{v}</span>
            </div>
          ))}
        </div>

        {(form.description || form.notes) && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {form.description && (
              <div style={{ background: 'var(--ct-bg-secondary)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', marginBottom: '7px' }}>Job Description Summary</div>
                <p style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{form.description}</p>
              </div>
            )}
            {form.notes && (
              <div style={{ background: 'var(--ct-bg-secondary)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', marginBottom: '7px' }}>Personal Notes</div>
                <p style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{form.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const panels = [StepCompany, StepRole, StepDetails, StepReview];
  const Panel  = panels[step - 1];

  const canNext = () => {
    if (step === 1) return !!form.company.trim();
    if (step === 2) return !!form.title.trim() && !!form.location.trim();
    return true;
  };

  return (
    <div className="page-enter" style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px', color: 'var(--ct-text-muted)' }}>
        <button onClick={() => navigate('/applications')} style={{ background: 'none', border: 'none', color: 'var(--ct-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={14} /> Applications
        </button>
        <span>›</span>
        <span style={{ color: 'var(--ct-primary)', fontWeight: '600' }}>New Application</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Add Job Application</h1>
        <p className="page-subtitle">Track every opportunity — fill in as much as you know.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '32px', position: 'relative' }}>
        {/* connecting line */}
        <div style={{ position: 'absolute', top: '17px', left: '17px', right: '17px', height: '2px', background: 'var(--ct-border)', zIndex: 0 }} />
        <div style={{
          position: 'absolute', top: '17px', left: '17px', height: '2px', zIndex: 0,
          background: 'var(--ct-primary)',
          width: `${((step - 1) / (STEPS.length - 1)) * (100 - (34 / 760) * 100)}%`,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
        }} />
        {STEPS.map(s => {
          const Icon = s.icon;
          const done = s.id < step;
          const active = s.id === step;
          return (
            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--ct-primary)' : active ? 'var(--ct-primary)' : 'var(--ct-card)',
                border: `2px solid ${done || active ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
                color: done || active ? '#fff' : 'var(--ct-text-muted)',
                transition: 'all 0.3s',
                boxShadow: active ? '0 0 0 5px rgba(79,70,229,0.15)' : 'none',
              }}>
                {done ? <CheckCircle2 size={16} fill="white" strokeWidth={0} /> : <Icon size={15} />}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: active ? 'var(--ct-primary)' : done ? 'var(--ct-text-secondary)' : 'var(--ct-text-muted)' }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div className="ct-card" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ct-text)', marginBottom: '4px' }}>
            Step {step}: {STEPS[step - 1].label}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)' }}>
            {step === 1 && 'Let\'s start with the company details.'}
            {step === 2 && 'Tell us about the role you\'re applying for.'}
            {step === 3 && 'Add extra context, notes and timeline.'}
            {step === 4 && 'Review everything before saving.'}
          </div>
        </div>

        <Panel />

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--ct-border)' }}>
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/applications')}
            className="btn-secondary"
          >
            <ChevronLeft size={15} />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* step dots */}
            <div style={{ display: 'flex', gap: '5px' }}>
              {STEPS.map(s => (
                <div key={s.id} style={{
                  width: s.id === step ? '18px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: s.id <= step ? 'var(--ct-primary)' : 'var(--ct-border)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            {step < 4 ? (
              <button
                className="btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                style={{ opacity: canNext() ? 1 : 0.5 }}
              >
                Continue
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={saving}
                id="submit-application-btn"
              >
                {saving
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  : <><Send size={15} /> Submit Application</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddApplication;
