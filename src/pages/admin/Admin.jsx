import React, { useState } from 'react';
import { Send, Bell, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/gateway';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'vibe-toast';

const Admin = () => {
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('/');
  const [sending, setSending] = useState(false);

  // Simple permission check rendering
  if (user?.role !== 'admin') {
    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <AlertCircle size={48} color="var(--ct-danger)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ct-text)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--ct-text-muted)' }}>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error('Title and body are required.');
      return;
    }
    
    setSending(true);
    try {
      const { data } = await api.post('/admin/push-notification', { title, body, link });
      toast.success(data.message);
      setTitle('');
      setBody('');
      setLink('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '26px' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage platform and broadcast notifications.</p>
      </div>

      <div className="ct-card" style={{ maxWidth: '600px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--ct-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="var(--ct-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ct-text)' }}>Broadcast Notification</h2>
            <p style={{ fontSize: '12px', color: 'var(--ct-text-muted)' }}>Send a push notification to all subscribed users.</p>
          </div>
        </div>

        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="ct-label">Notification Title</label>
            <input 
              className="ct-input" 
              placeholder="e.g. New Feature Update!" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="ct-label">Message Body</label>
            <textarea 
              className="ct-input" 
              placeholder="e.g. Check out the new analytics dashboard..." 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              rows={4}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="ct-label">Link (optional)</label>
            <input 
              className="ct-input" 
              placeholder="e.g. /analytics or https://example.com" 
              value={link} 
              onChange={e => setLink(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={sending}
            style={{ alignSelf: 'flex-start', marginTop: '8px' }}
          >
            {sending ? <><Loader2 size={15} className="spin" /> Broadcasting...</> : <><Send size={15} /> Send Broadcast</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
