import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, DollarSign, CalendarDays, ExternalLink, ChevronLeft, CalendarHeart, Sparkles } from 'lucide-react';
import api from '../api/gateway';
import { formatSalary } from '../utils/formatSalary';
import { toast } from 'vibe-toast';

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const appRes = await api.get(`/applications/${id}`);
                setApplication(appRes.data);

                const intRes = await api.get(`/interviews?applicationId=${id}`);
                setInterviews(intRes.data);
            } catch (err) {
                toast.error('Failed to fetch details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ct-text-muted)' }}>Loading application details...</div>;
    }

    if (!application) {
        return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ct-text-muted)' }}>Application not found.</div>;
    }

    return (
        <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--ct-text-muted)' }}>
                <button onClick={() => navigate('/applications')} style={{ background: 'none', border: 'none', color: 'var(--ct-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChevronLeft size={14} /> Applications
                </button>
                <span>›</span>
                <span style={{ color: 'var(--ct-primary)', fontWeight: '600' }}>{application.company}</span>
            </div>

            <div className="ct-card add-app-card" style={{ padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                        background: `${application.color || '#4f46e5'}22`, color: application.color || '#4f46e5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '20px'
                    }}>
                        {application.logo || application.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--ct-text)', wordBreak: 'break-word' }}>{application.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ct-text-secondary)', fontWeight: '500', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {application.company}</span>
                            <span>·</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {application.location} ({application.workMode})</span>
                        </div>
                    </div>
                    <div style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0,
                        background: 'var(--ct-primary-light)', color: 'var(--ct-primary)', border: '1px solid rgba(79, 70, 229, 0.2)'
                    }}>
                        {application.status}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'var(--ct-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ct-text-muted)', marginBottom: '4px' }}>Salary</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ct-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {formatSalary(application.salary, application.currency)}
                        </div>
                    </div>
                    <div style={{ background: 'var(--ct-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ct-text-muted)', marginBottom: '4px' }}>Date Applied</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ct-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CalendarDays size={14} /> {application.dateApplied ? new Date(application.dateApplied).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    <div style={{ background: 'var(--ct-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ct-text-muted)', marginBottom: '4px' }}>Job Type & Source</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ct-text)' }}>
                            {application.jobType} · {application.source}
                        </div>
                    </div>
                </div>

                {(application.skills || application.jobUrl) && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {application.skills && (
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ct-text-muted)', marginBottom: '6px' }}>Skills & Technologies</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {application.skills.split(',').map(skill => skill.trim()).filter(Boolean).map((skill, idx) => (
                                        <span key={idx} style={{ padding: '4px 10px', background: 'var(--ct-bg-secondary)', border: '1px solid var(--ct-border)', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: 'var(--ct-text)' }}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {application.jobUrl && (
                            <a href={application.jobUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ct-primary)', textDecoration: 'none' }}>
                                <ExternalLink size={14} /> View Original Listing
                            </a>
                        )}
                    </div>
                )}

                {(application.description || application.notes) && (
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--ct-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {application.description && (
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--ct-text)' }}>Description</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--ct-text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{application.description}</p>
                            </div>
                        )}
                        {application.notes && (
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--ct-text)' }}>Personal Notes</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--ct-text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{application.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Interviews Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CalendarHeart size={18} color="var(--ct-primary)" />
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--ct-text)' }}>Interview Schedule</h2>
            </div>
            
            {interviews.length === 0 ? (
                <div className="ct-card" style={{ padding: '32px', textAlign: 'center' }}>
                    <Sparkles size={24} color="var(--ct-text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ct-text-muted)' }}>No interviews scheduled yet.</div>
                    <div style={{ fontSize: '12px', color: 'var(--ct-text-secondary)', marginTop: '4px' }}>Once you get invited, track your interview rounds here (via the Pipeline view).</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {interviews.map(interview => (
                        <div key={interview._id} className="ct-card" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--ct-bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--ct-primary)', textTransform: 'uppercase' }}>{interview.date ? interview.date.split(' ')[0] : 'TBA'}</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ct-text)' }}>{interview.date ? interview.date.split(' ')[1]?.replace(',', '') : '-'}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ct-text)' }}>{interview.roundName || `Round ${interview.round}`}</div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', background: 'var(--ct-bg-secondary)', borderRadius: '6px', color: 'var(--ct-text-secondary)' }}>{interview.type}</div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--ct-text-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span>Time: <strong style={{ color: 'var(--ct-text)' }}>{interview.time || 'TBD'}</strong></span>
                                    <span>Venue / Link: <strong style={{ color: 'var(--ct-text)' }}>{interview.venue || 'Not provided'}</strong></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicationDetails;
