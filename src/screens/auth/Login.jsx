'use client';

import React, { useState } from 'react';
import { useNavigate, Link } from '../../routerCompat.js';
import { Eye, EyeOff, Mail, Lock, Briefcase, CheckCircle2, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/gateway';

const features = [
  'Track all your job applications in one place',
  'Visualise your pipeline with Kanban boards',
  'Never miss an interview with smart scheduling',
  'Analyse your success rates with rich analytics',
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm]         = useState({ email: '', password: '', remember: false });
  const [resetForm, setResetForm] = useState({ email: '', otp: '', password: '', confirm: '' });
  const [resetStep, setResetStep] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [notice, setNotice]     = useState('');
  const [error, setError]       = useState('');

  /* ── 2FA step (Commented out) ── */
  // const [require2FA, setRequire2FA] = useState(false);
  // const [userId2FA,  setUserId2FA]  = useState(null);
  // const [otp,        setOtp]        = useState('');
  // const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setError('');
    setNotice('');
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetForm((f) => ({
      ...f,
      [name]: name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
    setError('');
    setNotice('');
  };

  /* Step 1 — email + password */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });

      // if (data.require2FA) {
      //   setUserId2FA(data.userId);
      //   setRequire2FA(true);
      //   setLoading(false);
      //   return;
      // }

      await login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      setLoading(false);
    }
  };

  const startForgotPassword = () => {
    setResetForm((f) => ({ ...f, email: form.email || f.email }));
    setResetStep('forgot');
    setError('');
    setNotice('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetForm.email) { setError('Please enter your email address.'); return; }
    setResetLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: resetForm.email });
      setNotice(data.message || 'If an account exists, a reset code has been sent.');
      setResetStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetForm.email || resetForm.otp.length !== 6 || !resetForm.password || !resetForm.confirm) {
      setError('Please fill in all reset fields.');
      return;
    }
    if (resetForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (resetForm.password !== resetForm.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: resetForm.email,
        otp: resetForm.otp,
        password: resetForm.password,
      });
      setNotice(data.message || 'Password reset successfully. You can now sign in.');
      setForm((f) => ({ ...f, email: resetForm.email, password: '' }));
      setResetForm({ email: '', otp: '', password: '', confirm: '' });
      setResetStep('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const backToLogin = () => {
    setResetStep('login');
    setError('');
    setNotice('');
  };

  /* Step 2 — OTP verification (Commented out) */
  // const handleVerify2FA = async (e) => {
  //   e.preventDefault();
  //   if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
  //   setOtpLoading(true);
  //   try {
  //     const { data } = await api.post('/auth/verify-2fa-login', { userId: userId2FA, otp });
  //     await login(data, data.token);
  //     navigate('/dashboard');
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Invalid OTP');
  //     setOtpLoading(false);
  //   }
  // };

  return (
    <div className="auth-shell">
      {/* Left branding panel */}
      <aside className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2f6b5e, #557d66)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} color="white" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.02em' }}>ApplyLog</div>
              <div style={{ color: '#2f6b5e', fontSize: '9px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Premium Job Tracking</div>
            </div>
          </div>

          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.025em', lineHeight: '1.25', marginBottom: '12px' }}>
            Your career journey<br />starts here.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: '1.65', marginBottom: '36px' }}>
            Join thousands of job seekers who track their way to their dream role.
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={17} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: '1.5' }}>{f}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '44px', padding: '18px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '28px' }}>
            {[['10k+', 'Active Users'], ['95%', 'Success Rate'], ['4.9★', 'App Rating']].map(([v, l]) => (
              <div key={l}>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px' }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-card anim-fade-up">

          {/* ── 2FA Step (Commented out) ── */}
          {/* require2FA ? (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--ct-text)', letterSpacing: '-0.02em' }}>Two-Factor Verification 🔐</div>
                <p style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginTop: '6px' }}>
                  Enter the 6-digit code sent to <strong>{form.email}</strong>.
                </p>
              </div>

              {error && (
                <div style={{ background: 'var(--ct-danger-light)', border: '1px solid var(--ct-danger)', color: 'var(--ct-danger)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '18px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify2FA} id="verify-2fa-form">
                <div className="form-group">
                  <label className="ct-label" htmlFor="otp-input">Verification Code</label>
                  <input
                    id="otp-input" className="ct-input" type="text"
                    maxLength={6} value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    placeholder="_ _ _ _ _ _"
                    style={{ fontSize: '24px', letterSpacing: '12px', textAlign: 'center' }}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary" id="verify-otp-submit"
                  disabled={otpLoading || otp.length !== 6}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  {otpLoading ? <><Loader2 size={16} className="spin" /> Verifying…</> : 'Verify & Sign In'}
                </button>
              </form>

              <button onClick={() => { setRequire2FA(false); setOtp(''); setError(''); }}
                style={{ marginTop: '14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--ct-primary)', fontWeight: '600', display: 'block', textAlign: 'center', width: '100%' }}>
                ← Back to login
              </button>
            </>
          ) : ( */}
          {/* ── Normal Login ── */}
          <>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--ct-text)', letterSpacing: '-0.02em' }}>Welcome back 👋</h1>
                <p style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginTop: '5px' }}>Sign in to continue to ApplyLog</p>
              </div>

              {error && (
                <div style={{ background: 'var(--ct-danger-light)', border: '1px solid var(--ct-danger)', color: 'var(--ct-danger)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '18px' }}>
                  {error}
                </div>
              )}

              {notice && (
                <div style={{ background: 'var(--ct-success-light)', border: '1px solid var(--ct-success)', color: 'var(--ct-success)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '18px', fontWeight: '600' }}>
                  {notice}
                </div>
              )}

              {resetStep === 'forgot' && (
                <form onSubmit={handleForgotPassword} id="forgot-password-form">
                  <div className="form-group">
                    <label className="ct-label" htmlFor="forgot-email">Email address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                      <input id="forgot-email" name="email" type="email" autoComplete="email"
                        value={resetForm.email} onChange={handleResetChange} placeholder="you@example.com"
                        className="ct-input" style={{ paddingLeft: '40px' }} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={resetLoading}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {resetLoading ? <><Loader2 size={16} className="spin" /> Sending...</> : 'Send Reset Code'}
                  </button>
                  <button type="button" onClick={backToLogin}
                    style={{ marginTop: '14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--ct-primary)', fontWeight: '600', display: 'block', textAlign: 'center', width: '100%' }}>
                    Back to login
                  </button>
                </form>
              )}

              {resetStep === 'reset' && (
                <form onSubmit={handleResetPassword} id="reset-password-form">
                  <div className="form-group">
                    <label className="ct-label" htmlFor="reset-otp">Reset code</label>
                    <input id="reset-otp" name="otp" className="ct-input" value={resetForm.otp}
                      onChange={handleResetChange} inputMode="numeric" maxLength={6}
                      placeholder="_ _ _ _ _ _"
                      style={{ fontSize: '22px', letterSpacing: '10px', textAlign: 'center' }} required />
                  </div>
                  <div className="form-group">
                    <label className="ct-label" htmlFor="reset-password">New password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                      <input id="reset-password" name="password" type={showResetPass ? 'text' : 'password'}
                        autoComplete="new-password" value={resetForm.password} onChange={handleResetChange}
                        placeholder="Min. 8 characters" className="ct-input" style={{ paddingLeft: '40px', paddingRight: '40px' }} required />
                      <button type="button" onClick={() => setShowResetPass((v) => !v)}
                        style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ct-text-muted)', cursor: 'pointer', padding: '2px' }}>
                        {showResetPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="ct-label" htmlFor="reset-confirm">Confirm password</label>
                    <input id="reset-confirm" name="confirm" type={showResetPass ? 'text' : 'password'}
                      autoComplete="new-password" value={resetForm.confirm} onChange={handleResetChange}
                      placeholder="Repeat password" className="ct-input" required />
                  </div>
                  <button type="submit" className="btn-primary" disabled={resetLoading}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {resetLoading ? <><Loader2 size={16} className="spin" /> Resetting...</> : 'Reset Password'}
                  </button>
                  <button type="button" onClick={handleForgotPassword} disabled={resetLoading}
                    style={{ marginTop: '14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--ct-primary)', fontWeight: '600', display: 'block', textAlign: 'center', width: '100%' }}>
                    Resend code
                  </button>
                </form>
              )}

              {resetStep === 'login' && (
              <form onSubmit={handleSubmit} id="login-form">
                <div className="form-group">
                  <label className="ct-label" htmlFor="login-email">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                    <input id="login-email" name="email" type="email" autoComplete="email"
                      value={form.email} onChange={handleChange} placeholder="you@example.com"
                      className="ct-input" style={{ paddingLeft: '40px' }} required />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="ct-label" style={{ margin: 0 }} htmlFor="login-password">Password</label>
                    <button type="button" onClick={startForgotPassword} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--ct-primary)', fontWeight: '600' }}>Forgot password?</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                    <input id="login-password" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                      value={form.password} onChange={handleChange} placeholder="••••••••"
                      className="ct-input" style={{ paddingLeft: '40px', paddingRight: '40px' }} required />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ct-text-muted)', cursor: 'pointer', padding: '2px' }}
                      aria-label={showPass ? 'Hide password' : 'Show password'}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                  <input id="remember-me" name="remember" type="checkbox" checked={form.remember} onChange={handleChange}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--ct-primary)', cursor: 'pointer' }} />
                  <label htmlFor="remember-me" style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', cursor: 'pointer' }}>
                    Remember me for 30 days
                  </label>
                </div>

                <button type="submit" className="btn-primary" id="login-submit" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  {loading ? <><Loader2 size={16} className="spin" /> Signing in…</> : 'Sign In'}
                </button>
              </form>
              )}

              <div className="divider" style={{ margin: '24px 0' }} />
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ct-text-muted)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--ct-primary)', fontWeight: '700' }}>Create one free</Link>
              </p>
            </>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
