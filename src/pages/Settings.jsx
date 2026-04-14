import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Palette, Trash2, Lock, Moon, Sun,
  ChevronRight, Check, Camera, Clock, Loader2,
} from 'lucide-react';
import useThemeStore        from '../store/useThemeStore';
import useAuthStore         from '../store/useAuthStore';
import usePreferencesStore  from '../store/usePreferencesStore';
import { toast }            from 'vibe-toast';
import { TIMEZONES, DATE_FORMATS, TIME_FORMATS } from '../utils/dateTime';
import api from '../api/gateway';

/* ── helpers ─────────────────────────────────────────────────── */
const ACCENT_COLORS = [
  { hex: '#4f46e5', name: 'Indigo'  },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#f59e0b', name: 'Amber'   },
  { hex: '#ef4444', name: 'Red'     },
  { hex: '#8b5cf6', name: 'Violet'  },
  { hex: '#06b6d4', name: 'Cyan'    },
  { hex: '#f97316', name: 'Orange'  },
  { hex: '#ec4899', name: 'Pink'    },
];

/* ── Small sub-components ────────────────────────────────────── */
const ToggleRow = ({ id, label, description, checked, onChange }) => (
  <div className="settings-row">
    <div>
      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ct-text)' }}>{label}</div>
      {description && (
        <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginTop: '2px' }}>{description}</div>
      )}
    </div>
    <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '26px', flexShrink: 0, cursor: 'pointer' }}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '13px', transition: 'background 0.3s',
        background: checked ? 'var(--ct-primary)' : 'var(--ct-border)',
      }}>
        <span style={{
          position: 'absolute', width: '20px', height: '20px', borderRadius: '50%',
          background: 'white', top: '3px', left: '3px', transition: 'transform 0.3s',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }} />
      </span>
    </label>
  </div>
);

const SectionCard = ({ icon: Icon, title, color, children }) => (
  <div className="settings-section">
    <div className="settings-section-title">
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} style={{ color }} />
      </div>
      {title}
    </div>
    {children}
  </div>
);

const SelectField = ({ id, label, value, onChange, children }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="ct-label" htmlFor={id}>{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="ct-input"
      style={{ cursor: 'pointer' }}
    >
      {children}
    </select>
  </div>
);

/* ── Live date/time preview ──────────────────────────────────── */
const FormatPreview = ({ dateFormat: _df, timeFormat: _tf, timezone: _tz }) => {
  const { formatDate, formatTime } = usePreferencesStore.getState();

  // Use a fixed reference date for the preview so it's stable
  const refDate  = new Date(); // Jan 15 2025, 14:30
  const datePrev = formatDate(refDate);
  const timePrev = formatTime(refDate);

  return (
    <div style={{
      marginTop: '14px',
      padding: '12px 16px',
      borderRadius: '10px',
      background: 'var(--ct-bg)',
      border: '1px solid var(--ct-border)',
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date preview</div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ct-primary)' }}>{datePrev}</div>
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time preview</div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ct-primary)' }}>{timePrev}</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const Settings = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateUser }   = useAuthStore();
  const {
    dateFormat, timeFormat, timezone, accentColor, notifications,
    updatePreferences,
  } = usePreferencesStore();

  const isDark = theme === 'dark';

  /* ── Profile state ──────────────────────────────────────────── */
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    bio:   user?.bio   || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);

  /* ── Local pref state (mirrors store; saved on explicit action) */
  const [localPrefs, setLocalPrefs] = useState({
    dateFormat, timeFormat, timezone, accentColor,
  });

  /* ── Notifications local state ──────────────────────────────── */
  const [localNotifs, setLocalNotifs] = useState({ ...notifications });
  const [prefSaving,  setPrefSaving]  = useState(false);

  // Keep local pref state in sync when store loads from backend
  useEffect(() => {
    setLocalPrefs({ dateFormat, timeFormat, timezone, accentColor });
  }, [dateFormat, timeFormat, timezone, accentColor]);

  useEffect(() => {
    setLocalNotifs({ ...notifications });
  }, [notifications]);

  // Sync profile from auth store
  useEffect(() => {
    setProfile({ name: user?.name || '', email: user?.email || '', bio: user?.bio || '' });
  }, [user]);

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const { data } = await api.put('/user/profile', {
        name:  profile.name,
        email: profile.email,
        bio:   profile.bio,
      });
      updateUser({ name: data.name, email: data.email, bio: data.bio });
      setProfileSaved(true);
      toast.success('Profile saved!');
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      toast.error('Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      await updatePreferences({ ...localPrefs, notifications: localNotifs });
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setPrefSaving(false);
    }
  };

  const handleAccentSelect = (hex) => {
    setLocalPrefs((p) => ({ ...p, accentColor: hex }));
    // Live-preview the color change without persisting yet
    import('../store/usePreferencesStore').then(({ applyAccentColor }) => applyAccentColor(hex));
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ marginBottom: '26px' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, preferences, and notifications.</p>
      </div>

      {/* ── Profile ─────────────────────────────────────────────── */}
      <SectionCard icon={User} title="Profile" color="var(--ct-primary)">
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '28px',
            }}>
              {(profile.name[0] || '?').toUpperCase()}
            </div>
            <button
              style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--ct-primary)', border: '2px solid var(--ct-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}
              aria-label="Change photo"
            >
              <Camera size={11} />
            </button>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--ct-text)' }}>{profile.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginTop: '2px' }}>{profile.email}</div>
            <div style={{ fontSize: '11px', color: 'var(--ct-primary)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Premium Member
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rg-2" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="ct-label" htmlFor="pf-name">Full Name</label>
            <input id="pf-name" className="ct-input" value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="ct-label" htmlFor="pf-email">Email Address</label>
            <input id="pf-email" type="email" className="ct-input" value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="ct-label" htmlFor="pf-bio">Bio</label>
          <input id="pf-bio" className="ct-input" value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell us a little about yourself…" />
        </div>

        <button
          className="btn-primary"
          onClick={handleSaveProfile}
          disabled={profileSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          {profileSaving
            ? <><Loader2 size={14} className="spin" /> Saving…</>
            : profileSaved
              ? <><Check size={15} /> Saved!</>
              : 'Save Profile'}
        </button>
      </SectionCard>

      {/* ── Appearance ──────────────────────────────────────────── */}
      <SectionCard icon={Palette} title="Appearance" color="var(--ct-purple)">
        {/* Theme toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderRadius: '13px',
          background: isDark ? 'rgba(79,70,229,0.08)' : 'var(--ct-bg)',
          border: '1px solid var(--ct-border)', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: isDark ? 'rgba(79,70,229,0.15)' : 'rgba(245,158,11,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isDark
                ? <Moon size={20} style={{ color: 'var(--ct-primary)' }} />
                : <Sun  size={20} style={{ color: 'var(--ct-warning)'  }} />}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ct-text)' }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginTop: '2px' }}>
                {isDark ? 'Easy on the eyes, great for night-time use.' : 'Clean and bright, ideal for daytime use.'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`theme-toggle-track ${isDark ? 'on' : ''}`}
            style={{ flexShrink: 0 }}
          >
            <span className="theme-toggle-thumb" />
          </button>
        </div>

        {/* Accent color */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ct-text-muted)', marginBottom: '10px' }}>
            Accent Color
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ACCENT_COLORS.map(({ hex, name }) => (
              <button
                key={hex}
                title={name}
                onClick={() => handleAccentSelect(hex)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: hex,
                  border: localPrefs.accentColor === hex ? '3px solid var(--ct-text)' : '3px solid transparent',
                  cursor: 'pointer', transition: 'transform 0.15s', boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label={`Set accent to ${name}`}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Date & Time ─────────────────────────────────────────── */}
      <SectionCard icon={Clock} title="Date & Time" color="var(--ct-teal)">
        <div className="rg-2" style={{ marginBottom: '16px' }}>
          <SelectField
            id="dt-date-format"
            label="Date Format"
            value={localPrefs.dateFormat}
            onChange={(e) => setLocalPrefs((p) => ({ ...p, dateFormat: e.target.value }))}
          >
            {DATE_FORMATS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>

          <SelectField
            id="dt-time-format"
            label="Time Format"
            value={localPrefs.timeFormat}
            onChange={(e) => setLocalPrefs((p) => ({ ...p, timeFormat: e.target.value }))}
          >
            {TIME_FORMATS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
        </div>

        <SelectField
          id="dt-timezone"
          label="Timezone"
          value={localPrefs.timezone}
          onChange={(e) => setLocalPrefs((p) => ({ ...p, timezone: e.target.value }))}
        >
          {TIMEZONES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </SelectField>

        {/* Live preview */}
        <FormatPreview
          dateFormat={localPrefs.dateFormat}
          timeFormat={localPrefs.timeFormat}
          timezone={localPrefs.timezone}
        />
      </SectionCard>

      {/* ── Notifications (placeholder for future push) ──────────── */}
      <SectionCard icon={Bell} title="Notifications" color="var(--ct-success)">
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '20px',
            background: 'var(--ct-warning-light)', color: 'var(--ct-warning)',
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Coming soon
          </div>
        </div>
        {[
          { key: 'interview',    label: 'Interview Reminders',       description: 'Get notified 24 h and 1 h before each interview.' },
          { key: 'applications', label: 'Application Updates',       description: 'Status changes, new responses from recruiters.' },
          { key: 'weekly',       label: 'Weekly Summary',            description: 'A digest of your job-search activity every Monday.' },
          { key: 'reminders',    label: 'Smart Follow-up Reminders', description: 'AI-powered reminders to follow up with recruiters.' },
          { key: 'marketing',    label: 'Product Updates & Tips',    description: 'News about CareerTrack features and career advice.' },
        ].map(({ key, label, description }) => (
          <ToggleRow
            key={key}
            id={`notif-${key}`}
            label={label}
            description={description}
            checked={localNotifs[key] ?? false}
            onChange={(e) => setLocalNotifs((n) => ({ ...n, [key]: e.target.checked }))}
          />
        ))}
      </SectionCard>

      {/* ── Save preferences button ──────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          className="btn-primary"
          onClick={handleSavePreferences}
          disabled={prefSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          {prefSaving
            ? <><Loader2 size={14} className="spin" /> Saving…</>
            : 'Save Preferences'}
        </button>
      </div>

      {/* ── Privacy & Security ───────────────────────────────────── */}
      <SectionCard icon={Shield} title="Privacy & Security" color="var(--ct-warning)">
        {[
          { label: 'Change Password',           icon: Lock,   id: 'change-pass-btn' },
          { label: 'Two-Factor Authentication', icon: Shield, id: '2fa-btn'         },
        ].map((item) => (
          <button
            key={item.id}
            id={item.id}
            className="settings-row"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <item.icon size={15} style={{ color: 'var(--ct-text-muted)' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ct-text)' }}>{item.label}</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--ct-text-muted)' }} />
          </button>
        ))}
      </SectionCard>

      {/* ── Danger zone ─────────────────────────────────────────── */}
      <SectionCard icon={Trash2} title="Danger Zone" color="var(--ct-danger)">
        <div className="settings-row">
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ct-text)' }}>Delete Account</div>
            <div style={{ fontSize: '12px', color: 'var(--ct-danger)', marginTop: '2px' }}>
              This action is irreversible. All your data will be permanently deleted.
            </div>
          </div>
          <button
            id="delete-account-btn"
            style={{
              background: 'none', border: '1px solid var(--ct-danger)', color: 'var(--ct-danger)',
              borderRadius: '9px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ct-danger)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ct-danger)'; }}
            onClick={() => toast.error('Feature is not implemented.')}
          >
            Delete Account
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
