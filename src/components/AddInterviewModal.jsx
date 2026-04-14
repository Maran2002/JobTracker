import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, X, Video, Building2, Plus, Loader2, Trash2 } from 'lucide-react';
import api from '../api/gateway';
import { toast } from 'vibe-toast';

/* "2024-05-24" → "May 24, 2024"  (no timezone shift) */
const isoToDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

/* display to ISO for input date value */
const displayToIso = (disp) => {
    if (!disp) return '';
    try {
        const d = new Date(disp);
        if (isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    } catch {
        return '';
    }
};

/* "14:30" → "02:30 PM" */
const timeToDisplay = (t) => {
    if (!t) return t;
    // if already formatted
    if (t.includes('AM') || t.includes('PM')) return t;
    const [hRaw, min] = t.split(':').map(Number);
    const ampm = hRaw >= 12 ? 'PM' : 'AM';
    const h12  = hRaw % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;
};

/* display to "HH:mm" for input time value */
const displayToTime = (disp) => {
    if (!disp) return '';
    if (!disp.includes(' ')) return disp; // already HH:mm
    try {
        const [time, modifier] = disp.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    } catch {
        return '';
    }
}

const ACCENT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const AddInterviewModal = ({ onClose, onSaved, applicationId = null, applicationData = null, existingInterviews = [] }) => {
    const [form, setForm] = useState({
        company: '', title: '', location: '', logo: '', color: '#4f46e5',
    });
    const [rounds, setRounds] = useState([
        { id: Date.now(), round: 1, roundName: 'Round 1', date: '', time: '', venue: '', type: 'VIDEO CALL', _id: null }
    ]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [appDetails, setAppDetails] = useState(applicationData || null);

    useEffect(() => {
        if (!applicationData && applicationId) {
            api.get(`/applications/${applicationId}`)
                .then(res => setAppDetails(res.data))
                .catch(err => console.error("Error fetching application details", err));
        }
    }, [applicationId, applicationData]);

    useEffect(() => {
        if (appDetails) {
            setForm(prev => ({
                ...prev,
                company: appDetails.company || '',
                title: appDetails.title || '',
                location: appDetails.location || '',
                logo: appDetails.logo || appDetails.company?.slice(0, 2).toUpperCase() || '',
                color: appDetails.color || '#4f46e5'
            }));
        }
    }, [appDetails]);

    useEffect(() => {
        if (existingInterviews && existingInterviews.length > 0) {
            const first = existingInterviews[0];
            setForm({
                company: first.company || '',
                title: first.title || '',
                location: first.location || '',
                logo: first.logo || '',
                color: first.color || '#4f46e5'
            });
            setRounds(existingInterviews.map((itv, i) => ({
                id: Date.now() + i,
                _id: itv._id,
                round: itv.round || (i + 1),
                roundName: itv.roundName || `Round ${i + 1}`,
                date: displayToIso(itv.date),
                time: displayToTime(itv.time),
                venue: itv.venue || '',
                type: itv.type || 'VIDEO CALL'
            })));
        } else if (applicationData) {
            setForm({
                company: applicationData.company || '',
                title: applicationData.title || '',
                location: applicationData.location || '',
                logo: applicationData.logo || applicationData.company?.slice(0, 2).toUpperCase() || '',
                color: applicationData.color || '#4f46e5'
            });
        }
    }, [existingInterviews, applicationData]);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
    }, [onClose]);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleRoundChange = (id, field, value) => {
        setRounds(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const addRound = () => {
        setRounds(prev => [...prev, {
            id: Date.now(), round: prev.length + 1, roundName: `Round ${prev.length + 1}`,
            date: '', time: '', venue: '', type: 'VIDEO CALL', _id: null
        }]);
    };

    const removeRound = (id) => {
        if (rounds.length === 1) return;
        setRounds(prev => prev.filter(r => r.id !== id).map((r, i) => ({ ...r, round: i + 1 })));
    };

    const validate = () => {
        const e = {};

        const roundErrors = [];
        rounds.forEach((r, i) => {
            const re = {};
            if (!r.roundName.trim()) re.roundName = true;
            if (!r.date) re.date = true;
            if (!r.time) re.time = true;
            if (!r.venue.trim()) re.venue = true;
            roundErrors[i] = re;
        });

        if (roundErrors.some(re => Object.keys(re).length > 0)) {
            e.rounds = roundErrors;
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Please fill in all mandatory fields.");
            return;
        }
        setSaving(true);
        try {
            // Because we might have deleted some existing rounds, we should handle them
            // The easiest way is to push all current rounds to bulk endpoint,
            // and the backend will insert.
            // If the user is editing, we should probably delete existing ones for this application and re-insert,
            // or we use the bulk upsert logic. Since we built simple insertMany in backend,
            // let's delete existing interviews for this applicationId first if we are replacing them.
            // Wait, we didn't add DELETE /interviews/bulk.
            // Let's just do individual DELETE calls for the ones removed, PUT for updated, POST for new,
            // OR we can just delete all for this app and create new.
            
            if (applicationId && existingInterviews.length > 0) {
                // Find removed
                const currentIds = rounds.map(r => r._id).filter(id => id);
                const removedIds = existingInterviews.filter(e => !currentIds.includes(e._id)).map(e => e._id);
                for(let id of removedIds) {
                    await api.delete(`/interviews/${id}`);
                }
            }

            const newRoundsForBulk = [];
            
            for (let r of rounds) {
                const payload = {
                    ...form,
                    logo: form.logo.trim() || form.company.slice(0, 2).toUpperCase(),
                    logoColor: form.color,
                    applicationId: applicationId || null,
                    date: isoToDisplay(r.date),
                    time: timeToDisplay(r.time),
                    venue: r.venue,
                    type: r.type,
                    round: r.round,
                    roundName: r.roundName || `Round ${r.round}`
                };

                if (r._id) {
                    // Update existing
                    await api.put(`/interviews/${r._id}`, payload);
                } else {
                    // Add to bulk creation array
                    newRoundsForBulk.push(payload);
                }
            }
            
            if (newRoundsForBulk.length > 0) {
                await api.post('/interviews/bulk', { interviews: newRoundsForBulk });
            }

            toast.success('Interview schedule saved!');
            if (onSaved) onSaved();
            onClose();
        } catch {
            toast.error('Failed to save interview schedule.');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = (err) => ({
        width: '100%', padding: '9px 12px', borderRadius: '9px',
        border: `1.5px solid ${err ? 'var(--ct-danger)' : 'var(--ct-border)'}`,
        background: 'var(--ct-input-bg)', color: 'var(--ct-text)',
        fontSize: '13px', fontFamily: 'inherit', outline: 'none',
        transition: 'border-color 0.18s',
    });

    return createPortal(
        <>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(3px)', zIndex: 400,
            }} ></div>

            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '600px', maxWidth: '95vw', maxHeight: '90vh',
                background: 'var(--ct-card)', borderRadius: 'var(--ct-radius)',
                border: '1px solid var(--ct-border)', zIndex: 401,
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--ct-shadow-md)', overflowY: 'hidden',
            }}>
                {/* header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px', borderBottom: '1px solid var(--ct-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CalendarDays size={17} color="var(--ct-primary)" />
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ct-text)' }}>
                            {existingInterviews && existingInterviews.length > 0 ? "Update Interview Schedule" : "Add Interview Schedule"}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ width: '30px', height: '30px', border: '1px solid var(--ct-border)', borderRadius: '7px', background: 'var(--ct-bg)', color: 'var(--ct-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={13} />
                    </button>
                </div>

                {/* body */}
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>

                    {/* Application Info Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--ct-bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ct-border)' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${form.color}22`, color: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800' }}>
                           {form.logo || form.company?.slice(0, 2).toUpperCase() || 'C'}
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ct-text)' }}>{form.title || 'Loading Application...'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--ct-text-muted)', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <Building2 size={12} /> {form.company || 'Loading...'}
                            </div>
                        </div>
                    </div>

                    {/* Rounds */}
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ct-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interview Rounds</div>
                            <button onClick={addRound} type="button" style={{ fontSize: '11px', fontWeight: '700', background: 'var(--ct-primary-light)', color: 'var(--ct-primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Plus size={12} /> Add Round
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {rounds.map((r, i) => {
                                const rErr = errors.rounds ? errors.rounds[i] || {} : {};
                                return (
                                    <div key={r.id} style={{ position: 'relative', border: '1px solid var(--ct-border)', borderRadius: '10px', padding: '16px', background: 'var(--ct-bg)' }}>
                                        {rounds.length > 1 && (
                                            <button onClick={() => removeRound(r.id)} type="button" style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--ct-danger)', cursor: 'pointer', padding: '4px' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        
                                        <div className="rg-2-1" style={{ gap: '12px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', display: 'block', marginBottom: '5px' }}>Round Name *</label>
                                                <input value={r.roundName} onChange={e => handleRoundChange(r.id, 'roundName', e.target.value)} placeholder={`Round ${i + 1}`} style={inputStyle(rErr.roundName)} />
                                            </div>
                                            <div className="rg-2" style={{ gap: '12px' }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', display: 'block', marginBottom: '5px' }}>Date *</label>
                                                    <input type="date" value={r.date} onChange={e => handleRoundChange(r.id, 'date', e.target.value)} style={{ ...inputStyle(rErr.date), colorScheme: 'light dark' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', display: 'block', marginBottom: '5px' }}>Time *</label>
                                                    <input type="time" value={r.time} onChange={e => handleRoundChange(r.id, 'time', e.target.value)} style={{ ...inputStyle(rErr.time), colorScheme: 'light dark' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', display: 'block', marginBottom: '5px' }}>Venue / Link *</label>
                                                <input value={r.venue} onChange={e => handleRoundChange(r.id, 'venue', e.target.value)} placeholder="e.g. meet.google.com/..." style={inputStyle(rErr.venue)} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ct-text-muted)', display: 'block', marginBottom: '8px' }}>Type</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {['VIDEO CALL', 'ON-SITE'].map(t => (
                                                        <button key={t} onClick={() => handleRoundChange(r.id, 'type', t)} type="button"
                                                            style={{
                                                                flex: 1, padding: '9px', borderRadius: '9px', fontSize: '11px', fontWeight: '700',
                                                                cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                                                border:      `1.5px solid ${r.type === t ? 'var(--ct-primary)' : 'var(--ct-border)'}`,
                                                                background:  r.type === t ? 'var(--ct-primary-light)' : 'transparent',
                                                                color:       r.type === t ? 'var(--ct-primary)' : 'var(--ct-text-secondary)',
                                                            }}>
                                                            {t === 'VIDEO CALL' ? <Video size={12} /> : <Building2 size={12} />}
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div style={{ padding: '16px 22px', borderTop: '1px solid var(--ct-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'var(--ct-bg-secondary)', borderBottomLeftRadius: 'var(--ct-radius)', borderBottomRightRadius: 'var(--ct-radius)' }}>
                    <button onClick={onClose} disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--ct-border)', background: 'var(--ct-bg)', color: 'var(--ct-text)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--ct-primary)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                        {saving ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

export default AddInterviewModal;
