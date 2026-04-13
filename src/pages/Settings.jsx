import React, { useState } from 'react';
import {
  User, Bell, Shield, Palette, Trash2, Lock, Moon, Sun,
  ChevronRight, Check, Camera,
} from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import useAuthStore  from '../store/useAuthStore';
import { toast } from 'vibe-toast';

/* ── Toggle row ── */
const ToggleRow = ({ id, label, description, checked, onChange }) => (
  <div className="settings-row">
    <div>
      <div style={{ fontWeight:'600', fontSize:'14px', color:'var(--ct-text)' }}>{label}</div>
      {description && <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'2px' }}>{description}</div>}
    </div>
    <label style={{ position:'relative', display:'inline-block', width:'46px', height:'26px', flexShrink:0, cursor:'pointer' }}>
      <input
        id={id} type="checkbox" checked={checked} onChange={onChange}
        style={{ opacity:0, width:0, height:0, position:'absolute' }}
      />
      <span style={{
        position:'absolute', inset:0, borderRadius:'13px', transition:'background 0.3s',
        background: checked ? 'var(--ct-primary)' : 'var(--ct-border)',
      }}>
        <span style={{
          position:'absolute', width:'20px', height:'20px', borderRadius:'50%',
          background:'white', top:'3px', left:'3px', transition:'transform 0.3s',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          boxShadow:'0 2px 4px rgba(0,0,0,0.2)',
        }} />
      </span>
    </label>
  </div>
);

/* ── Section ── */
const SectionCard = ({ icon: Icon, title, color, children }) => (
  <div className="settings-section">
    <div className="settings-section-title">
      <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={15} style={{ color }} />
      </div>
      {title}
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateUser }   = useAuthStore();
  const isDark = theme === 'dark';

  const [profile, setProfile] = useState({
    name:  user?.name  || 'Siddharth',
    email: user?.email || 'siddharth@example.com',
    role:  user?.role  || 'Product Designer',
    bio:   'Passionate product designer with 5+ years building user-centric interfaces for top-tier companies.',
  });

  const [notifs, setNotifs] = useState({
    interview: true, applications: true, weekly: true, reminders: false, marketing: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ name: profile.name, email: profile.email });
    setSaved(true);
    toast.success('Profile saved successfully!');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ marginBottom:'26px' }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, preferences, and notifications.</p>
      </div>

      {/* ── Profile ── */}
      <SectionCard icon={User} title="Profile" color="var(--ct-primary)">
        {/* Avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'22px', flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <div style={{
              width:'72px', height:'72px', borderRadius:'50%',
              background:'linear-gradient(135deg, #4f46e5, #6366f1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontWeight:'800', fontSize:'28px',
            }}>
              {profile.name[0]?.toUpperCase()}
            </div>
            <button
              style={{
                position:'absolute', bottom:'0', right:'0',
                width:'24px', height:'24px', borderRadius:'50%',
                background:'var(--ct-primary)', border:'2px solid var(--ct-card)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', color:'white',
              }}
              aria-label="Change photo"
            >
              <Camera size={11} />
            </button>
          </div>
          <div>
            <div style={{ fontWeight:'700', fontSize:'16px', color:'var(--ct-text)' }}>{profile.name}</div>
            <div style={{ fontSize:'13px', color:'var(--ct-text-muted)', marginTop:'2px' }}>{profile.email}</div>
            <div style={{ fontSize:'11px', color:'var(--ct-primary)', fontWeight:'600', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.07em' }}>
              Premium Member
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="ct-label" htmlFor="pf-name">Full Name</label>
            <input id="pf-name" className="ct-input" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="ct-label" htmlFor="pf-email">Email Address</label>
            <input id="pf-email" type="email" className="ct-input" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="ct-label" htmlFor="pf-role">Current Role</label>
            <input id="pf-role" className="ct-input" value={profile.role} onChange={e => setProfile(p => ({...p, role: e.target.value}))} />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="ct-label" htmlFor="pf-bio">Bio</label>
            <input id="pf-bio" className="ct-input" value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} />
          </div>
        </div>

        <button
          className="btn-primary"
          id="save-profile-btn"
          onClick={handleSave}
          style={{ display:'flex', alignItems:'center', gap:'7px' }}
        >
          {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
        </button>
      </SectionCard>

      {/* ── Appearance / Theme ── */}
      <SectionCard icon={Palette} title="Appearance" color="var(--ct-purple)">
        {/* Theme toggle — prominent */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 20px', borderRadius:'13px',
          background: isDark ? 'rgba(79,70,229,0.08)' : 'var(--ct-bg)',
          border:'1px solid var(--ct-border)', marginBottom:'14px',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{
              width:'44px', height:'44px', borderRadius:'12px',
              background: isDark ? 'rgba(79,70,229,0.15)' : 'rgba(245,158,11,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {isDark
                ? <Moon size={20} style={{ color:'var(--ct-primary)' }} />
                : <Sun  size={20} style={{ color:'var(--ct-warning)'  }} />
              }
            </div>
            <div>
              <div style={{ fontWeight:'700', fontSize:'15px', color:'var(--ct-text)' }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div style={{ fontSize:'12px', color:'var(--ct-text-muted)', marginTop:'2px' }}>
                {isDark
                  ? 'Easy on the eyes, great for night-time use.'
                  : 'Clean and bright, ideal for daytime use.'}
              </div>
            </div>
          </div>

          {/* Theme toggle button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`theme-toggle-track ${isDark ? 'on' : ''}`}
            style={{ flexShrink:0 }}
          >
            <span className="theme-toggle-thumb" />
          </button>
        </div>

        {/* Theme palette options */}
        <div>
          <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--ct-text-muted)', marginBottom:'10px' }}>Accent Color</div>
          <div style={{ display:'flex', gap:'10px' }}>
            {[
              '#4f46e5','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4',
            ].map(c => (
              <button
                key={c}
                style={{
                  width:'28px', height:'28px', borderRadius:'50%',
                  background:c, border: c === '#4f46e5' ? '3px solid var(--ct-text)' : '3px solid transparent',
                  cursor:'pointer', transition:'transform 0.15s', boxSizing:'border-box',
                }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                aria-label={`Set accent color to ${c}`}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard icon={Bell} title="Notifications" color="var(--ct-success)">
        <ToggleRow
          id="notif-interview" label="Interview Reminders"
          description="Get notified 24h and 1h before each interview."
          checked={notifs.interview} onChange={e => setNotifs(n => ({...n, interview: e.target.checked}))}
        />
        <ToggleRow
          id="notif-applications" label="Application Updates"
          description="Status changes, new responses from recruiters."
          checked={notifs.applications} onChange={e => setNotifs(n => ({...n, applications: e.target.checked}))}
        />
        <ToggleRow
          id="notif-weekly" label="Weekly Summary"
          description="A digest of your job search activity every Monday."
          checked={notifs.weekly} onChange={e => setNotifs(n => ({...n, weekly: e.target.checked}))}
        />
        <ToggleRow
          id="notif-reminders" label="Smart Follow-up Reminders"
          description="AI-powered reminders to follow up with recruiters."
          checked={notifs.reminders} onChange={e => setNotifs(n => ({...n, reminders: e.target.checked}))}
        />
        <ToggleRow
          id="notif-marketing" label="Product Updates & Tips"
          description="News about CareerTrack features and career advice."
          checked={notifs.marketing} onChange={e => setNotifs(n => ({...n, marketing: e.target.checked}))}
        />
      </SectionCard>

      {/* ── Privacy & Security ── */}
      <SectionCard icon={Shield} title="Privacy & Security" color="var(--ct-warning)">
        {[
          { label:'Change Password', icon:Lock,      id:'change-pass-btn' },
          { label:'Two-Factor Authentication', icon:Shield, id:'2fa-btn' },

        ].map(item => (
          <button
            key={item.id}
            id={item.id}
            className="settings-row"
            style={{ width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
              <item.icon size={15} style={{ color:'var(--ct-text-muted)' }} />
              <span style={{ fontWeight:'600', fontSize:'14px', color:'var(--ct-text)' }}>{item.label}</span>
            </div>
            <ChevronRight size={16} style={{ color:'var(--ct-text-muted)' }} />
          </button>
        ))}
      </SectionCard>

      {/* ── Danger zone ── */}
      <SectionCard icon={Trash2} title="Danger Zone" color="var(--ct-danger)">
        <div className="settings-row">
          <div>
            <div style={{ fontWeight:'600', fontSize:'14px', color:'var(--ct-text)' }}>Delete Account</div>
            <div style={{ fontSize:'12px', color:'var(--ct-danger)', marginTop:'2px' }}>
              This action is irreversible. All your data will be permanently deleted.
            </div>
          </div>
          <button
            id="delete-account-btn"
            style={{
              background:'none', border:'1px solid var(--ct-danger)', color:'var(--ct-danger)',
              borderRadius:'9px', padding:'8px 16px', fontSize:'13px', fontWeight:'600',
              cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--ct-danger)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='none';             e.currentTarget.style.color='var(--ct-danger)'; }}
            onClick={() => toast.error('Account deletion requires email confirmation. Check your inbox.')}
          >
            Delete Account
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
