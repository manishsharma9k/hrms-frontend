import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Plus, X, CheckCircle, XCircle, Clock, AlertCircle, Download, Eye } from 'lucide-react';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { downloadLeaveApprovalPDF, downloadLeaveRejectionPDF, downloadLeaveApplicationPDF } from '../../utils/leavePdfUtils';
import LeaveViewModal from '../../components/LeaveViewModal';

const LeaveRequests = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showView, setShowView] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('All');

    const fetchLeaves = async () => {
        try { const res = await leaveAPI.getMyLeaves(); setLeaves(res.data.data); }
        catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date cannot be before start date');
        setSubmitting(true);
        try {
            await leaveAPI.apply(form);
            toast.success('Leave request submitted successfully!');
            setShowForm(false);
            setForm({ startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to apply for leave'); }
        finally { setSubmitting(false); }
    };

    const counts = { All: leaves.length, Pending: leaves.filter(l => l.status === 'Pending').length, Approved: leaves.filter(l => l.status === 'Approved').length, Rejected: leaves.filter(l => l.status === 'Rejected').length };
    const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

    const statusCfg = {
        Approved: { cls: 'badge-success', icon: <CheckCircle size={12} />, bg: '#ECFDF5', border: '#6EE7B7' },
        Rejected: { cls: 'badge-danger', icon: <XCircle size={12} />, bg: '#FFF1F2', border: '#FCA5A5' },
        Pending:  { cls: 'badge-warning', icon: <Clock size={12} />, bg: '#FFFBEB', border: '#FDE68A' },
    };

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    const totalApproved = counts.Approved;
    const totalDays = leaves.filter(l => l.status === 'Approved').reduce((s, l) => s + Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} color="#F59E0B" /> Leave Requests</h2>
                    <p className="page-subtitle">Submit and track your leave applications</p>
                </div>
                <button onClick={() => setShowForm(p => !p)} className="btn btn-primary" style={{ background: showForm ? '#64748B' : 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Apply Leave</>}
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.875rem' }}>
                {[
                    { label: 'Total Applied', value: counts.All, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
                    { label: 'Approved', value: counts.Approved, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                    { label: 'Pending', value: counts.Pending, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Rejected', value: counts.Rejected, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
                    { label: 'Days Taken', value: totalDays, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '0.875rem', padding: '1rem', border: `1px solid ${s.color}25` }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Apply Form */}
            {showForm && (
                <div className="card" style={{ padding: '1.5rem', border: '2px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.02)' }}>
                    <p style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} color="#F59E0B" /> New Leave Application
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ margin: '0 0 1rem' }}>
                            <label className="form-label">Employee ID</label>
                            <input className="form-input" value={user?.employeeId || '—'} readOnly style={{ background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed', fontFamily: 'monospace', fontWeight: 700 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Start Date</label>
                                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required min={new Date().toISOString().slice(0, 10)} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">End Date</label>
                                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required min={form.startDate || new Date().toISOString().slice(0, 10)} />
                            </div>
                        </div>
                        {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
                            <div style={{ marginBottom: '1rem', padding: '0.625rem 0.875rem', background: 'rgba(245,158,11,0.08)', borderRadius: '0.5rem', fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                                📅 Duration: {Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1} day(s)
                            </div>
                        )}
                        <div className="form-group" style={{ margin: '0 0 1rem' }}>
                            <label className="form-label">Reason for Leave</label>
                            <textarea className="form-input" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} required minLength={5} maxLength={300} placeholder="Please describe the reason for your leave request..." style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {submitting ? <><span className="btn-spinner" /> Submitting...</> : <><CheckCircle size={14} /> Submit Application</>}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.35rem 1rem', borderRadius: '9999px', border: '1.5px solid', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        background: filter === f ? (f === 'Approved' ? '#D1FAE5' : f === 'Rejected' ? '#FEE2E2' : f === 'Pending' ? '#FEF3C7' : '#EDE9FE') : '#fff',
                        color: filter === f ? (f === 'Approved' ? '#065F46' : f === 'Rejected' ? '#991B1B' : f === 'Pending' ? '#92400E' : '#5B21B6') : '#64748B',
                        borderColor: filter === f ? 'currentColor' : '#E2E8F0'
                    }}>
                        {f} ({counts[f] ?? filtered.length})
                    </button>
                ))}
            </div>

            {/* Leave Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
                        <Calendar size={40} color="#CBD5E1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                        <p style={{ color: '#94A3B8', fontWeight: 500 }}>No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests found</p>
                    </div>
                )}
                {filtered.map(l => {
                    const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1;
                    const cfg = statusCfg[l.status] || statusCfg.Pending;
                    return (
                        <div key={l._id} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1.125rem 1.25rem', border: `1px solid ${cfg.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Calendar size={20} color={l.status === 'Approved' ? '#10B981' : l.status === 'Rejected' ? '#EF4444' : '#F59E0B'} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                                        {new Date(l.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(l.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '1px 7px', borderRadius: '9999px' }}>{days}d</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {cfg.icon} {l.status}
                                </span>
                                {l.status === 'Approved' && (
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                        <button onClick={() => { setSelectedLeave(l); setShowView(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '0.5rem', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Eye size={12} /> View
                                        </button>
                                        <button onClick={() => downloadLeaveApprovalPDF(l, user)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '0.5rem', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Download size={12} /> Approval Letter
                                        </button>
                                    </div>
                                )}
                                {l.status === 'Rejected' && (
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setSelectedLeave(l); setShowView(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: '0.5rem', color: '#991B1B', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Eye size={12} /> View
                                        </button>
                                        <button onClick={() => downloadLeaveRejectionPDF(l, user)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: '0.5rem', color: '#991B1B', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Download size={12} /> Rejection Letter
                                        </button>
                                    </div>
                                )}
                                {l.status === 'Pending' && (
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button onClick={() => downloadLeaveApplicationPDF(l, user)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '0.5rem', color: '#92400E', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Download size={12} /> Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {showView && selectedLeave && <LeaveViewModal leave={selectedLeave} employee={user} onClose={() => { setShowView(false); setSelectedLeave(null); }} />}
        </div>
    );
};

export default LeaveRequests;
