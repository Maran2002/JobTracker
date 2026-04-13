import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Briefcase } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/gateway';

const Register = () => {
  const navigate  = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords don\'t match.');
      return;
    }
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)            s++;
    if (/[A-Z]/.test(p))          s++;
    if (/[0-9]/.test(p))          s++;
    if (/[^A-Za-z0-9]/.test(p))   s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981', '#10b981'][strength];

  return (
    <div className="auth-shell">
      {/* Left branding */}
      <aside className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '44px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={22} color="white" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.02em' }}>CareerTrack</div>
              <div style={{ color: '#4f46e5', fontSize: '9px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Premium Job Tracking</div>
            </div>
          </div>

          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.025em', lineHeight: '1.25', marginBottom: '14px' }}>
            Start tracking your<br />career today.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: '1.65', marginBottom: '36px' }}>
            Create your free account and take control of your job search in under 2 minutes.
          </p>

          {/* Decorative gradient blobs */}
          <div style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              What you get for free
            </div>
            {[
              'Unlimited job application tracking',
              'Kanban pipeline & interview calendar',
              'Analytics dashboard & insights',
              'Profile strength optimizer',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '8px 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-form-card anim-fade-up">
          <div style={{ marginBottom: '26px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--ct-text)', letterSpacing: '-0.02em' }}>
              Create your account ✨
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--ct-text-muted)', marginTop: '5px' }}>
              Free forever · No credit card required
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--ct-danger-light)', border: '1px solid var(--ct-danger)',
              color: 'var(--ct-danger)', borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', marginBottom: '18px',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} id="register-form">
            {/* Full name */}
            <div className="form-group">
              <label className="ct-label" htmlFor="reg-name">Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                <input id="reg-name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Siddharth Kumar" className="ct-input" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="ct-label" htmlFor="reg-email">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                <input id="reg-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="ct-input" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="ct-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  autoComplete="new-password" value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" className="ct-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }} required
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ct-text-muted)', cursor: 'pointer', padding: '2px' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map((n) => (
                      <div key={n} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: n <= strength ? strengthColor : 'var(--ct-border)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: strengthColor, fontWeight: '600' }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="ct-label" htmlFor="reg-confirm">Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)', pointerEvents: 'none' }} />
                <input id="reg-confirm" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" className="ct-input" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginBottom: '18px', lineHeight: '1.6' }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--ct-primary)' }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: 'var(--ct-primary)' }}>Privacy Policy</a>.
            </p>

            <button type="submit" className="btn-primary" id="register-submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </span>
              ) : 'Create Free Account'}
            </button>
          </form>

          <div className="divider" style={{ margin: '22px 0' }} />

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ct-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--ct-primary)', fontWeight: '700' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;
