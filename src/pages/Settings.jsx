import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User, Bell, Shield, Palette, Trash2, Lock, Moon, Sun,
  ChevronRight, Check, Camera, Clock, Loader2, X, Eye, EyeOff,
  Smartphone,
} from 'lucide-react';
import useThemeStore        from '../store/useThemeStore';
import useAuthStore         from '../store/useAuthStore';
import usePreferencesStore  from '../store/usePreferencesStore';
import useNotificationStore from '../store/useNotificationStore';
import { toast }            from 'vibe-toast';
import { TIMEZONES, DATE_FORMATS, TIME_FORMATS } from '../utils/dateTime';
import api from '../api/gateway';

/* ── Accent color palette ─────────────────────────────────────── */
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

/* ═══════════════════════════════════════════
   MODAL WRAPPER — renders at document.body via portal
   so it is always centered without scrolling the page
   ═══════════════════════════════════════════ */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--ct-card)', borderRadius: '18px', padding: '28px',
        width: '100%', maxWidth: '420px',
        border: '1px solid var(--ct-border)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
        animation: 'scaleIn 0.2s ease both',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontWeight: '800', fontSize: '17px', color: 'var(--ct-text)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ct-text-muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

/* ── OTP Step component ────────── */
const OtpStep = ({ purpose, email, onVerified, onCancel }) => {
  const [step, setStep] = useState('send'); // 'send' | 'enter'
  const [otp, setOtp]   = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    setBusy(true);
    try {
      await api.post('/user/send-otp', { purpose });
      toast.success(`OTP sent to ${email}`);
      setStep('enter');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {step === 'send' ? (
        <>
          <p style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', marginBottom: '20px' }}>
            We'll send a 6-digit verification code to <strong>{email}</strong>. It expires in 10 minutes.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={sendOtp} disabled={busy}>
              {busy ? <><Loader2 size={13} className="spin" /> Sending…</> : 'Send OTP'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', marginBottom: '16px' }}>
            Enter the 6-digit code sent to <strong>{email}</strong>.
          </p>
          <input
            className="ct-input" value={otp} maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="_ _ _ _ _ _"
            style={{ fontSize: '22px', letterSpacing: '10px', textAlign: 'center', marginBottom: '16px' }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={sendOtp} disabled={busy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--ct-primary)', fontWeight: '600' }}
            >
              {busy ? 'Resending…' : 'Resend OTP'}
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={onCancel}>Cancel</button>
              <button className="btn-primary" onClick={() => onVerified(otp)} disabled={otp.length !== 6}>
                Verify
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────────── */
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
    <select id={id} value={value} onChange={onChange} className="ct-input" style={{ cursor: 'pointer' }}>
      {children}
    </select>
  </div>
);

const FormatPreview = ({ dateFormat: _df, timeFormat: _tf, timezone: _tz }) => {
  const { formatDate, formatTime } = usePreferencesStore.getState();
  const refDate = new Date();
  return (
    <div style={{
      marginTop: '14px', padding: '12px 16px', borderRadius: '10px',
      background: 'var(--ct-bg)', border: '1px solid var(--ct-border)',
      display: 'flex', gap: '24px', flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date preview</div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ct-primary)' }}>{formatDate(refDate)}</div>
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--ct-text-muted)', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time preview</div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ct-primary)' }}>{formatTime(refDate)}</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const Settings = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateUser, logout }  = useAuthStore();
  const {
    dateFormat, timeFormat, timezone, accentColor, notifications,
    updatePreferences,
  } = usePreferencesStore();
  const {
    pushPermission, requestPushPermission, unsubscribePush,
  } = useNotificationStore();

  const isDark = theme === 'dark';

  /* ── Profile state ────── */
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', bio: user?.bio || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);

  /* ── Prefs state ────── */
  const [localPrefs, setLocalPrefs]   = useState({ dateFormat, timeFormat, timezone, accentColor });
  const [localNotifs, setLocalNotifs] = useState({ ...notifications });
  const [prefSaving,  setPrefSaving]  = useState(false);

  /* ── Modal states ────── */
  const [changePwModal,    setChangePwModal]    = useState(false);
  const [twoFaModal,       setTwoFaModal]       = useState(false);
  const [deleteModal,      setDeleteModal]      = useState(false);

  /* ── Change Password state ────── */
  const [cpOtpDone,   setCpOtpDone]   = useState(false);
  const [cpNewPw,     setCpNewPw]     = useState('');
  const [cpConfirm,   setCpConfirm]   = useState('');
  const [cpShowPw,    setCpShowPw]    = useState(false);
  const [cpBusy,      setCpBusy]      = useState(false);

  /* ── Delete Account state ────── */
  const [delOtpDone,   setDelOtpDone]  = useState(false);
  const [delConfirmText, setDelConfirmText] = useState('');
  const [delBusy,      setDelBusy]    = useState(false);

  /* ── Push notification busy ────── */
  const [pushBusy, setPushBusy] = useState(false);

  /* Sync from store */
  useEffect(() => { setLocalPrefs({ dateFormat, timeFormat, timezone, accentColor }); }, [dateFormat, timeFormat, timezone, accentColor]);
  useEffect(() => { setLocalNotifs({ ...notifications }); }, [notifications]);
  useEffect(() => { setProfile({ name: user?.name || '', email: user?.email || '', bio: user?.bio || '' }); }, [user]);

  /* Reset modals when closed */
  const resetChangePw = () => { setCpOtpDone(false); setCpNewPw(''); setCpConfirm(''); };
  const resetDelete   = () => { setDelOtpDone(false); setDelConfirmText(''); };

  /* ── Handlers ── */
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const { data } = await api.put('/user/profile', { name: profile.name, email: profile.email, bio: profile.bio });
      updateUser({ name: data.name, email: data.email, bio: data.bio });
      setProfileSaved(true);
      toast.success('Profile saved!');
      setTimeout(() => setProfileSaved(false), 2500);
    } catch { toast.error('Failed to save profile.'); }
    finally { setProfileSaving(false); }
  };

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      await updatePreferences({ ...localPrefs, notifications: localNotifs });
      toast.success('Preferences saved!');
    } catch { toast.error('Failed to save preferences.'); }
    finally { setPrefSaving(false); }
  };

  const handleAccentSelect = (hex) => {
    setLocalPrefs((p) => ({ ...p, accentColor: hex }));
    import('../store/usePreferencesStore').then(({ applyAccentColor }) => applyAccentColor(hex));
  };

  /* Change Password — after OTP verified */
  const handleChangePassword = async (otp) => {
    if (!cpNewPw || cpNewPw.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (cpNewPw !== cpConfirm)          { toast.error('Passwords do not match.');                 return; }
    setCpBusy(true);
    try {
      await api.post('/user/change-password', { otp, newPassword: cpNewPw });
      toast.success('Password changed successfully!');
      setChangePwModal(false);
      resetChangePw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setCpBusy(false); }
  };

  /* Toggle 2FA — after OTP verified */
  const handleToggle2FA = async (otp) => {
    try {
      const { data } = await api.post('/user/toggle-2fa', { otp });
      updateUser({ isTwoFactorEnabled: data.isTwoFactorEnabled });
      toast.success(data.message);
      setTwoFaModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update 2FA.');
    }
  };

  /* Delete Account — after OTP verified */
  const handleDeleteAccount = async (otp) => {
    if (delConfirmText !== 'DELETE') { toast.error('Please type DELETE to confirm.'); return; }
    setDelBusy(true);
    try {
      await api.post('/user/delete-account', { otp });
      toast.success('Account deactivated. Signing out…');
      setTimeout(() => { logout(); window.location.href = '/login'; }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally { setDelBusy(false); }
  };

  /* Push notification toggle */
  const handlePushToggle = async () => {
    setPushBusy(true);
    if (pushPermission === 'granted') {
      await unsubscribePush();
      toast.success('Push notifications disabled.');
    } else {
      const result = await requestPushPermission();
      if (result === 'granted') toast.success('Push notifications enabled!');
      else if (result === 'denied') toast.error('Permission denied. Please allow notifications in browser settings.');
      else if (result === 'unsupported') toast.error('Your browser does not support push notifications.');
    }
    setPushBusy(false);
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ marginBottom: '26px' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, preferences, and notifications.</p>
      </div>

      {/* ── Profile ── */}
      <SectionCard icon={User} title="Profile" color="var(--ct-primary)">
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
            <button style={{
              position: 'absolute', bottom: '0', right: '0',
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'var(--ct-primary)', border: '2px solid var(--ct-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }} aria-label="Change photo">
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

        <button className="btn-primary" onClick={handleSaveProfile} disabled={profileSaving}>
          {profileSaving ? <><Loader2 size={14} className="spin" /> Saving…</> : profileSaved ? <><Check size={15} /> Saved!</> : 'Save Profile'}
        </button>
      </SectionCard>

      {/* ── Appearance ── */}
      <SectionCard icon={Palette} title="Appearance" color="var(--ct-purple)">
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
              {isDark ? <Moon size={20} style={{ color: 'var(--ct-primary)' }} /> : <Sun size={20} style={{ color: 'var(--ct-warning)' }} />}
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
          <button onClick={toggleTheme} aria-label="Toggle theme"
            className={`theme-toggle-track ${isDark ? 'on' : ''}`} style={{ flexShrink: 0 }}>
            <span className="theme-toggle-thumb" />
          </button>
        </div>

        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ct-text-muted)', marginBottom: '10px' }}>Accent Color</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ACCENT_COLORS.map(({ hex, name }) => (
              <button key={hex} title={name} onClick={() => handleAccentSelect(hex)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: hex,
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

      {/* ── Date & Time ── */}
      <SectionCard icon={Clock} title="Date & Time" color="var(--ct-teal)">
        <div className="rg-2" style={{ marginBottom: '16px' }}>
          <SelectField id="dt-date-format" label="Date Format" value={localPrefs.dateFormat}
            onChange={(e) => setLocalPrefs((p) => ({ ...p, dateFormat: e.target.value }))}>
            {DATE_FORMATS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </SelectField>
          <SelectField id="dt-time-format" label="Time Format" value={localPrefs.timeFormat}
            onChange={(e) => setLocalPrefs((p) => ({ ...p, timeFormat: e.target.value }))}>
            {TIME_FORMATS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </SelectField>
        </div>
        <SelectField id="dt-timezone" label="Timezone" value={localPrefs.timezone}
          onChange={(e) => setLocalPrefs((p) => ({ ...p, timezone: e.target.value }))}>
          {TIMEZONES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </SelectField>
        <FormatPreview dateFormat={localPrefs.dateFormat} timeFormat={localPrefs.timeFormat} timezone={localPrefs.timezone} />
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard icon={Bell} title="Notifications" color="var(--ct-success)">
        {/* Push notification enable/disable */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', borderRadius: '12px', marginBottom: '14px',
          flexWrap: 'wrap', gap: '12px',
          background: pushPermission === 'granted' ? 'var(--ct-primary-light)' : 'var(--ct-bg)',
          border: `1px solid ${pushPermission === 'granted' ? 'rgba(var(--ct-primary-rgb),0.25)' : 'var(--ct-border)'}`,
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ct-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={15} style={{ color: pushPermission === 'granted' ? 'var(--ct-primary)' : 'var(--ct-text-muted)' }} />
              Push Notifications
              {pushPermission === 'granted' && (
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: 'var(--ct-primary)', color: '#fff' }}>ON</span>
              )}
              {pushPermission === 'denied' && (
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: 'var(--ct-danger-light)', color: 'var(--ct-danger)' }}>BLOCKED</span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginTop: '3px' }}>
              {pushPermission === 'denied'
                ? 'Blocked in browser settings. Allow in site permissions.'
                : 'Get real-time browser notifications for interviews and updates.'}
            </div>
          </div>
          {pushPermission !== 'denied' && (
            <button
              onClick={handlePushToggle} disabled={pushBusy}
              className={pushPermission === 'granted' ? 'btn-secondary' : 'btn-primary'}
              style={{ fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {pushBusy ? <Loader2 size={13} className="spin" /> : pushPermission === 'granted' ? 'Disable' : 'Enable'}
            </button>
          )}
        </div>

        {/* Email notification toggles */}
        {[
          { key: 'interview',    label: 'Interview Reminders',   description: 'Get notified 24 h and 1 h before each interview.' },
          // { key: 'applications', label: 'Application Updates',   description: 'Status changes and new responses.' },
          // { key: 'weekly',       label: 'Weekly Summary',         description: 'A digest of your job-search activity every Monday.' },
          // { key: 'reminders',    label: 'Smart Reminders',        description: 'AI-powered follow-up reminders.' },
          { key: 'marketing',    label: 'Product Updates & Tips', description: 'News about CareerTrack features.' },
        ].map(({ key, label, description }) => (
          <ToggleRow key={key} id={`notif-${key}`} label={label} description={description}
            checked={localNotifs[key] ?? false}
            onChange={(e) => setLocalNotifs((n) => ({ ...n, [key]: e.target.checked }))} />
        ))}
      </SectionCard>

      {/* ── Save Preferences ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn-primary" onClick={handleSavePreferences} disabled={prefSaving}>
          {prefSaving ? <><Loader2 size={14} className="spin" /> Saving…</> : 'Save Preferences'}
        </button>
      </div>

      {/* ── Privacy & Security ── */}
      <SectionCard icon={Shield} title="Privacy & Security" color="var(--ct-warning)">
        {/* Change Password */}
        <button id="change-pass-btn" className="settings-row"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          onClick={() => { setChangePwModal(true); resetChangePw(); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Lock size={15} style={{ color: 'var(--ct-text-muted)' }} />
            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ct-text)' }}>Change Password</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--ct-text-muted)' }} />
        </button>

        {/* 2FA */}
        <button id="2fa-btn" className="settings-row"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          onClick={() => setTwoFaModal(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Shield size={15} style={{ color: 'var(--ct-text-muted)' }} />
            <div>
              <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ct-text)' }}>Two-Factor Authentication</span>
              <div style={{ fontSize: '11px', color: user?.isTwoFactorEnabled ? 'var(--ct-success)' : 'var(--ct-text-muted)', marginTop: '1px' }}>
                {user?.isTwoFactorEnabled ? '✓ Enabled — OTP required at login' : 'Disabled'}
              </div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--ct-text-muted)' }} />
        </button>
      </SectionCard>

      {/* ── Danger Zone ── */}
      <SectionCard icon={Trash2} title="Danger Zone" color="var(--ct-danger)">
        <div className="settings-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ct-text)' }}>Delete Account</div>
            <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginTop: '2px' }}>
              Your account will be deactivated. You can register again with the same email.
            </div>
          </div>
          <button id="delete-account-btn"
            style={{
              background: 'none', border: '1px solid var(--ct-danger)', color: 'var(--ct-danger)',
              borderRadius: '9px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ct-danger)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ct-danger)'; }}
            onClick={() => { setDeleteModal(true); resetDelete(); }}
          >
            Delete Account
          </button>
        </div>
      </SectionCard>

      {/* ═══════ MODALS ═══════ */}

      {/* Change Password Modal */}
      <Modal isOpen={changePwModal} onClose={() => { setChangePwModal(false); resetChangePw(); }} title="Change Password">
        {!cpOtpDone ? (
          <>
            <p style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', marginBottom: '16px' }}>
              Enter your new password, then verify with a one-time code sent to <strong>{user?.email}</strong>.
            </p>
            <div className="form-group">
              <label className="ct-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="ct-input" type={cpShowPw ? 'text' : 'password'} value={cpNewPw}
                  onChange={(e) => setCpNewPw(e.target.value)} placeholder="Min. 6 characters"
                  style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setCpShowPw(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ct-text-muted)', display: 'flex' }}>
                  {cpShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="ct-label">Confirm New Password</label>
              <input className="ct-input" type={cpShowPw ? 'text' : 'password'} value={cpConfirm}
                onChange={(e) => setCpConfirm(e.target.value)} placeholder="Repeat password" />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setChangePwModal(false); resetChangePw(); }}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                if (!cpNewPw || cpNewPw.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
                if (cpNewPw !== cpConfirm) { toast.error('Passwords do not match.'); return; }
                setCpOtpDone(true);
              }}>Continue</button>
            </div>
          </>
        ) : (
          <OtpStep
            purpose="change-password"
            email={user?.email}
            onVerified={handleChangePassword}
            onCancel={() => { setChangePwModal(false); resetChangePw(); }}
          />
        )}
      </Modal>

      {/* 2FA Modal */}
      <Modal isOpen={twoFaModal} onClose={() => setTwoFaModal(false)} title={`${user?.isTwoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication`}>
        <p style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', marginBottom: '16px' }}>
          {user?.isTwoFactorEnabled
            ? 'Disabling 2FA means you will only need your password to log in.'
            : 'Enabling 2FA adds an extra OTP step every time you log in, sent to your email.'}
        </p>
        <OtpStep
          purpose="toggle-2fa"
          email={user?.email}
          onVerified={handleToggle2FA}
          onCancel={() => setTwoFaModal(false)}
        />
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={deleteModal} onClose={() => { setDeleteModal(false); resetDelete(); }} title="Delete Account">
        {!delOtpDone ? (
          <>
            <div style={{
              background: 'var(--ct-danger-light)', borderRadius: '10px', padding: '12px 16px',
              fontSize: '13px', color: 'var(--ct-danger)', marginBottom: '16px', fontWeight: '600',
            }}>
              ⚠ Your account will be deactivated. This cannot be undone without registering again.
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="ct-label">Type <strong>DELETE</strong> to confirm</label>
              <input className="ct-input" value={delConfirmText}
                onChange={(e) => setDelConfirmText(e.target.value)}
                placeholder="DELETE" />
            </div>
            <OtpStep
              purpose="delete-account"
              email={user?.email}
              onVerified={(otp) => {
                if (delConfirmText !== 'DELETE') { toast.error('Please type DELETE to confirm.'); return; }
                handleDeleteAccount(otp);
              }}
              onCancel={() => { setDeleteModal(false); resetDelete(); }}
            />
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default Settings;
