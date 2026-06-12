import React, { useState, useContext, useEffect } from 'react';
import { Briefcase, Plus, X, Mail, Send, ArrowLeft, QrCode, Copy, ExternalLink, RefreshCw, Share2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const colColors = {
    Applied: { bg: '#EFF6FF', border: '#BFDBFE', badge: 'badge-info', dot: '#3B82F6' },
    Screening: { bg: '#FFF7ED', border: '#FED7AA', badge: 'badge-warning', dot: '#F97316' },
    Interview: { bg: '#F5F3FF', border: '#DDD6FE', badge: 'badge-purple', dot: '#8B5CF6' },
    Offer: { bg: '#ECFDF5', border: '#A7F3D0', badge: 'badge-success', dot: '#10B981' },
    Hired: { bg: '#F0FDF4', border: '#86EFAC', badge: 'badge-success', dot: '#16A34A' },
    Rejected: { bg: '#FEF2F2', border: '#FECACA', badge: 'badge-danger', dot: '#EF4444' },
};

const initialCandidates = {
    Applied: [],
    Screening: [],
    Interview: [],
    Offer: [],
    Hired: [],
    Rejected: []
};

const Recruitment = () => {
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pipeline, setPipeline] = useState(initialCandidates);
    const [showModal, setShowModal] = useState(false);
    const [newCandidate, setNewCandidate] = useState({ name: '', role: '', exp: '', location: '' });
    const [dragging, setDragging] = useState(null);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerCandidate, setOfferCandidate] = useState(null);
    const [offerForm, setOfferForm] = useState({
        companyName: '', hrName: '', hrDesignation: '',
        department: '', salary: '', joiningDate: '',
        workLocation: '', workingHours: '', reportingManager: '',
        additionalBenefits: '', offerExpiry: ''
    });
    const [offerStatus, setOfferStatus] = useState('');
    const [offerLoading, setOfferLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const applicationUrl = `${window.location.origin}/candidate-apply`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(applicationUrl)}`;

    const copyApplicationLink = async () => {
        try {
            await navigator.clipboard?.writeText(applicationUrl);
            toast.success('Candidate form link copied');
        } catch {
            toast.error('Could not copy link');
        }
    };

    const shareApplicationQr = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Candidate Application Form',
                    text: 'Scan this QR or open the link to apply.',
                    url: applicationUrl
                });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }
        copyApplicationLink();
    };

    const groupCandidates = (candidates) => {
        const grouped = Object.keys(initialCandidates).reduce((acc, stage) => ({ ...acc, [stage]: [] }), {});
        candidates.forEach(candidate => {
            const stage = grouped[candidate.stage] ? candidate.stage : 'Applied';
            grouped[stage].push(candidate);
        });
        return grouped;
    };

    const fetchCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/recruitment');
            setPipeline(groupCandidates(res.data.data || []));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const openOfferModal = (candidate) => {
        setOfferCandidate(candidate);
        setOfferForm(f => ({ ...f, department: candidate.role || '' }));
        setOfferStatus('');
        setShowOfferModal(true);
    };

    const handleSendOffer = async (e) => {
        e.preventDefault();
        if (!offerCandidate?.email) {
            setOfferStatus('error:Please add candidate email first');
            return;
        }
        setOfferLoading(true);
        setOfferStatus('');
        try {
            await api.post('/admin/offer-letter', {
                candidateName: offerCandidate.name,
                candidateEmail: offerCandidate.email,
                role: offerCandidate.role,
                ...offerForm,
                salary: Number(offerForm.salary)
            });
            setOfferStatus('success');
            setTimeout(() => { setShowOfferModal(false); setOfferStatus(''); }, 1800);
        } catch (err) {
            setOfferStatus('error:' + (err.response?.data?.error || 'Failed to send offer letter'));
        } finally {
            setOfferLoading(false);
        }
    };

    const of = (k) => (e) => setOfferForm(f => ({ ...f, [k]: e.target.value }));

    const totalCandidates = Object.values(pipeline).flat().length;

    const addCandidate = async () => {
        if (!newCandidate.name || !newCandidate.role) return;
        try {
            await api.post('/admin/recruitment', newCandidate);
            setNewCandidate({ name: '', role: '', exp: '', location: '' });
            setShowModal(false);
            fetchCandidates();
        } catch (err) {
            setError(err.response?.data?.error || 'Error adding candidate');
        }
    };

    const moveCandidate = async (candidate, fromCol, toCol) => {
        if (fromCol === toCol) return;
        const previous = pipeline;
        setPipeline(p => ({
            ...p,
            [fromCol]: p[fromCol].filter(c => c._id !== candidate._id),
            [toCol]: [{ ...candidate, stage: toCol }, ...p[toCol]]
        }));
        try {
            await api.put(`/admin/recruitment/${candidate._id}/action`, { stage: toCol, action: `Moved to ${toCol}` });
        } catch (err) {
            setPipeline(previous);
            setError(err.response?.data?.error || 'Error moving candidate');
        }
    };

    const removeCandidate = async (id, col) => {
        if (!window.confirm('Delete this candidate?')) return;
        const previous = pipeline;
        setPipeline(p => ({ ...p, [col]: p[col].filter(c => c._id !== id) }));
        try {
            await api.delete(`/admin/recruitment/${id}`);
        } catch (err) {
            setPipeline(previous);
            setError(err.response?.data?.error || 'Error deleting candidate');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Briefcase size={20} color="#06B6D4" /> Recruitment Pipeline</h2>
                    <p className="page-subtitle">{totalCandidates} candidates across {Object.keys(pipeline).length} stages</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn btn-outline" onClick={fetchCandidates}><RefreshCw size={15} /> Refresh</button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#06B6D4,#0891B2)' }}><Plus size={15} /> Add Candidate</button>
                </div>
            </div>

            {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '0.75rem', padding: '0.875rem 1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 220px', gap: '1rem', alignItems: 'stretch' }}>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: '0.75rem', background: '#ECFEFF', color: '#0891B2' }}><QrCode size={22} /></div>
                        <div>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Candidate Form QR</p>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748B' }}>Candidates scan this QR, submit details, and appear here.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input readOnly value={applicationUrl} className="form-input" style={{ flex: '1 1 260px', minWidth: 0, fontSize: '0.82rem' }} />
                        <button className="btn btn-outline" onClick={copyApplicationLink}><Copy size={14} /> Copy</button>
                        <button className="btn btn-outline" onClick={shareApplicationQr}><Share2 size={14} /> Share QR</button>
                        <a className="btn btn-outline" href={qrUrl} download="candidate-form-qr.png" style={{ textDecoration: 'none' }}><Download size={14} /> Download QR</a>
                        <a className="btn btn-primary" href={applicationUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#06B6D4,#0891B2)' }}><ExternalLink size={14} /> Open Form</a>
                    </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1rem', display: 'grid', placeItems: 'center', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
                    <img src={qrUrl} alt="Candidate application QR code" style={{ width: 170, height: 170, display: 'block' }} />
                </div>
            </div>

            {/* Stage Summary */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {Object.entries(pipeline).map(([stage, candidates]) => (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colColors[stage].dot, flexShrink: 0 }} />
                        {stage}: <span style={{ color: '#0F172A' }}>{candidates.length}</span>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="empty-state" style={{ minHeight: 260 }}><Briefcase size={40} /><p>Loading candidates...</p></div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {Object.entries(pipeline).map(([stage, candidates]) => {
                    const cfg = colColors[stage];
                    return (
                        <div key={stage} style={{ background: cfg.bg, borderRadius: '0.875rem', padding: '0.875rem', border: `1px solid ${cfg.border}`, minWidth: '200px', minHeight: '300px' }}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                e.preventDefault();
                                if (dragging && dragging.fromCol !== stage) moveCandidate(dragging.candidate, dragging.fromCol, stage);
                                setDragging(null);
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot }} />
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: '#0F172A' }}>{stage}</p>
                                </div>
                                <span style={{ background: '#fff', border: `1px solid ${cfg.border}`, color: '#475569', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>{candidates.length}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {candidates.map(c => (
                                    <div key={c._id} draggable
                                        onDragStart={() => setDragging({ candidate: c, fromCol: stage })}
                                        style={{ background: '#fff', borderRadius: '0.625rem', padding: '0.75rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'grab', position: 'relative' }}>
                                        <button onClick={() => removeCandidate(c._id, stage)} style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.125rem', display: 'flex' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}>
                                            <X size={12} />
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <div className="avatar avatar-sm" style={{ background: `hsl(${c.name.charCodeAt(0) * 10},65%,55%)`, fontSize: '0.7rem' }}>{c.name.charAt(0)}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.78rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                                            </div>
                                        </div>
                                        <p style={{ margin: '0 0 0.375rem', fontSize: '0.72rem', color: '#4F46E5', fontWeight: 600 }}>{c.role}</p>
                                        {c.email && <p style={{ margin: '0 0 0.375rem', fontSize: '0.68rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>}
                                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                            {c.exp && <span style={{ fontSize: '0.65rem', color: '#64748B', background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{c.exp}</span>}
                                            {c.location && <span style={{ fontSize: '0.65rem', color: '#64748B', background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{c.location}</span>}
                                        </div>
                                        {/* Move buttons */}
                                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                            {Object.keys(pipeline).filter(s => s !== stage).map(s => (
                                                <button key={s} onClick={() => moveCandidate(c, stage, s)}
                                                    style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', background: colColors[s].bg, border: `1px solid ${colColors[s].border}`, borderRadius: '0.25rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                                                    → {s}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Offer Letter Button — show for Offer & Hired stage */}
                                        {(stage === 'Offer' || stage === 'Hired') && (
                                            <button onClick={() => openOfferModal(c)}
                                                style={{ marginTop: '0.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.3rem 0', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: '0.375rem', color: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
                                                <Mail size={11} /> Send Offer Letter
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {candidates.length === 0 && (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#CBD5E1', fontSize: '0.75rem', border: '2px dashed #E2E8F0', borderRadius: '0.625rem' }}>Drop here</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {/* Offer Letter Modal */}
            {showOfferModal && offerCandidate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '1.25rem 1.5rem', borderRadius: '1rem 1rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.45rem', display: 'flex' }}><Mail size={18} color="#fff" /></div>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Send Offer Letter</h3>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>Compose & send via email to candidate</p>
                                </div>
                            </div>
                            <button onClick={() => setShowOfferModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.375rem', color: '#fff', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSendOffer} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Candidate Info (read-only) */}
                            <div style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: '0.75rem', padding: '1rem' }}>
                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Candidate Details</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Candidate Name</label>
                                        <input className="form-input" value={offerCandidate.name} readOnly style={{ background: '#f8fafc', color: '#64748b' }} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Candidate Email *</label>
                                        <input type="email" className="form-input" placeholder="candidate@email.com" required
                                            value={offerCandidate.email || ''}
                                            onChange={e => setOfferCandidate(c => ({ ...c, email: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Role / Designation *</label>
                                        <input className="form-input" value={offerCandidate.role} readOnly style={{ background: '#f8fafc', color: '#64748b' }} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Department *</label>
                                        <input className="form-input" placeholder="e.g. Engineering" required value={offerForm.department} onChange={of('department')} />
                                    </div>
                                </div>
                            </div>

                            {/* Company & HR Info */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company & HR Information</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Company Name *</label>
                                        <input className="form-input" placeholder="e.g. TechCorp Pvt. Ltd." required value={offerForm.companyName} onChange={of('companyName')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">HR Name *</label>
                                        <input className="form-input" placeholder="e.g. Priya Sharma" required value={offerForm.hrName} onChange={of('hrName')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                        <label className="form-label">HR Designation</label>
                                        <input className="form-input" placeholder="e.g. HR Manager" value={offerForm.hrDesignation} onChange={of('hrDesignation')} />
                                    </div>
                                </div>
                            </div>

                            {/* Offer Terms */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Offer Terms</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Gross Monthly Salary (₹) *</label>
                                        <input type="number" className="form-input" placeholder="e.g. 55000" min="1" required value={offerForm.salary} onChange={of('salary')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Date of Joining *</label>
                                        <input type="date" className="form-input" required value={offerForm.joiningDate} onChange={of('joiningDate')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Work Location</label>
                                        <input className="form-input" placeholder="e.g. Mumbai HQ" value={offerForm.workLocation} onChange={of('workLocation')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Working Hours</label>
                                        <input className="form-input" placeholder="e.g. 9 AM – 6 PM (Mon–Sat)" value={offerForm.workingHours} onChange={of('workingHours')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Reporting Manager</label>
                                        <input className="form-input" placeholder="e.g. Rajesh Kumar" value={offerForm.reportingManager} onChange={of('reportingManager')} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Offer Expiry Date</label>
                                        <input type="date" className="form-input" value={offerForm.offerExpiry} onChange={of('offerExpiry')} />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Benefits */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Additional Benefits <span style={{ color: '#94a3b8', fontWeight: 400 }}>(one per line)</span></label>
                                <textarea className="form-input" rows={4} placeholder={`Health Insurance (Family Cover)\nAnnual Performance Bonus\n5 Days Paid Leave per Quarter\nFlexible Work From Home`}
                                    value={offerForm.additionalBenefits} onChange={of('additionalBenefits')}
                                    style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem' }} />
                            </div>

                            {/* Salary Preview */}
                            {offerForm.salary > 0 && (
                                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.78rem', color: '#065f46' }}>
                                    <strong>CTC Preview:</strong> Monthly ₹{Number(offerForm.salary).toLocaleString('en-IN')} &nbsp;|&nbsp; Annual ₹{(Number(offerForm.salary) * 12).toLocaleString('en-IN')}
                                </div>
                            )}

                            {offerStatus === 'success' ? (
                                <p style={{ color: '#10b981', fontWeight: 700, margin: 0, fontSize: '0.875rem', textAlign: 'center' }}>✓ Offer letter sent successfully!</p>
                            ) : offerStatus.startsWith('error:') ? (
                                <p style={{ color: '#ef4444', margin: 0, fontSize: '0.85rem' }}>{offerStatus.replace('error:', '')}</p>
                            ) : null}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" disabled={offerLoading}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: offerLoading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: offerLoading ? 'not-allowed' : 'pointer' }}>
                                    {offerLoading ? <><span className="btn-spinner" /> Sending...</> : <><Send size={15} /> Send Offer Letter</>}
                                </button>
                                <button type="button" onClick={() => setShowOfferModal(false)}
                                    style={{ flex: 1, padding: '0.7rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Candidate Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Candidate</h3>
                            <button onClick={() => setShowModal(false)} className="btn-ghost"><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Full Name</label>
                                <input className="form-input" placeholder="Candidate name" value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} maxLength={50} minLength={2} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Role Applied For</label>
                                <input className="form-input" placeholder="e.g. Frontend Developer" value={newCandidate.role} onChange={e => setNewCandidate({ ...newCandidate, role: e.target.value })} maxLength={60} required />
                            </div>
                            <div className="grid-2">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Experience</label>
                                    <input className="form-input" placeholder="e.g. 3 yrs" value={newCandidate.exp} onChange={e => setNewCandidate({ ...newCandidate, exp: e.target.value })} maxLength={20} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Location</label>
                                    <input className="form-input" placeholder="e.g. Mumbai" value={newCandidate.location} onChange={e => setNewCandidate({ ...newCandidate, location: e.target.value })} maxLength={50} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={addCandidate}>Add Candidate</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recruitment;
