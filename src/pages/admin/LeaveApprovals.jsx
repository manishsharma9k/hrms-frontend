import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, CheckCircle, XCircle, Download, Eye, Search, X, Filter, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leavesAdminAPI } from '../../services/api';
import { downloadLeaveApplicationPDF } from '../../utils/leavePdfUtils';
import LeaveViewModal from '../../components/LeaveViewModal';
import PageLoader from '../../components/PageLoader';
import toast from 'react-hot-toast';

// Reject Reason Modal
const RejectModal = ({ leave, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const quickReasons = ['Insufficient leave balance', 'Critical project deadline', 'Team understaffed during this period', 'Already approved leave for another team member', 'Medical certificate required'];
    const handleConfirm = async () => {
        if (!reason.trim()) { toast.error('Please enter a rejection reason'); return; }
        setLoading(true);
        await onConfirm(reason.trim());
        setLoading(false);
    };
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '460px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}><XCircle size={20} color="#fff" /></div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Reject Leave Request</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{leave?.employee?.name} · {leave ? Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1 : 0} days</p>
                    </div>
                    <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.375rem', padding: '0.3rem', cursor: 'pointer', display: 'flex', color: '#fff' }}><X size={16} /></button>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Quick Reasons</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                        {quickReasons.map((r, i) => (
                            <button key={i} onClick={() => setReason(r)}
                                style={{ padding: '0.3rem 0.625rem', borderRadius: '9999px', border: `1.5px solid ${reason === r ? '#EF4444' : '#E2E8F0'}`, background: reason === r ? '#FEE2E2' : '#F8FAFC', color: reason === r ? '#991B1B' : '#475569', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Custom Reason <span style={{ color: '#EF4444' }}>*</span></p>
                    <textarea
                        value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        rows={3} maxLength={300}
                        style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#0F172A' }}
                        onFocus={e => e.target.style.borderColor = '#EF4444'}
                        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#94A3B8', textAlign: 'right' }}>{reason.length}/300</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', padding: '0 1.5rem 1.25rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.625rem', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleConfirm} disabled={loading || !reason.trim()}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem', background: reason.trim() ? '#EF4444' : '#FCA5A5', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#fff', cursor: reason.trim() ? 'pointer' : 'not-allowed' }}>
                        {loading ? <><span className="btn-spinner" /> Rejecting...</> : <><XCircle size={14} /> Reject Leave</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LeaveApprovals = () => {
    const { } = useContext(AuthContext);
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showView, setShowView] = useState(false);
    const [rejectLeave, setRejectLeave] = useState(null);

    const fetchLeaves = async () => {
        try { const r = await leavesAdminAPI.getAll(); setLeaves(r.data.data); }
        catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const updateStatus = async (id, status, rejectionReason = '') => {
        setActionLoading(p => ({ ...p, [id]: status }));
        try {
            await leavesAdminAPI.updateStatus(id, { status, rejectionReason });
            toast.success(status === 'Approved' ? '✅ Leave approved' : '❌ Leave rejected');
            fetchLeaves();
        } catch { toast.error('Failed to update leave status'); }
        finally { setActionLoading(p => { const n = { ...p }; delete n[id]; return n; }); }
    };

    const handleReject = async (reason) => {
        await updateStatus(rejectLeave._id, 'Rejected', reason);
        setRejectLeave(null);
    };

    const filtered = leaves.filter(l => {
        const matchSearch = l.employee?.name?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || l.status === filter;
        return matchSearch && matchFilter;
    });

    const counts = { All: leaves.length, Pending: leaves.filter(l => l.status === 'Pending').length, Approved: leaves.filter(l => l.status === 'Approved').length, Rejected: leaves.filter(l => l.status === 'Rejected').length };

    if (loading) return <PageLoader text="Loading leave requests..." />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                        <h2 className="page-title"><Calendar size={20} color="#F59E0B" /> Leave Management</h2>
                    </div>
                    <p className="page-subtitle">Review and manage employee leave requests</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{ padding: '0.4rem 1rem', borderRadius: '9999px', border: '1.5px solid', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            background: filter === f ? (f === 'Pending' ? '#FEF3C7' : f === 'Approved' ? '#D1FAE5' : f === 'Rejected' ? '#FEE2E2' : '#EDE9FE') : '#fff',
                            color: filter === f ? (f === 'Pending' ? '#92400E' : f === 'Approved' ? '#065F46' : f === 'Rejected' ? '#991B1B' : '#5B21B6') : '#64748B',
                            borderColor: filter === f ? 'currentColor' : '#E2E8F0'
                        }}>
                        {f} <span style={{ marginLeft: '0.25rem', opacity: 0.7 }}>({counts[f]})</span>
                    </button>
                ))}
            </div>

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="search-bar" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search size={15} color="#94A3B8" />
                        <input placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}><X size={14} /></button>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{filtered.length} requests</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Duration</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(leave => {
                                const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                return (
                                    <tr key={leave._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>{leave.employee?.name?.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{leave.employee?.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{leave.employee?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                                            {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                        </td>
                                        <td><span className="badge badge-info">{days}d</span></td>
                                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' }}>{leave.reason}</td>
                                        <td>
                                            <span className={`badge ${leave.status === 'Approved' ? 'badge-success' : leave.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                                {leave.status === 'Pending' ? (
                                                    <>
                                                        <button onClick={() => updateStatus(leave._id, 'Approved')} disabled={!!actionLoading[leave._id]} className="btn btn-sm btn-success" style={{ gap: '0.3rem' }}>
                                                            {actionLoading[leave._id] === 'Approved' ? <span className="btn-spinner" /> : <CheckCircle size={13} />} Approve
                                                        </button>
                                                        <button onClick={() => setRejectLeave(leave)} disabled={!!actionLoading[leave._id]} className="btn btn-sm btn-danger" style={{ gap: '0.3rem' }}>
                                                            {actionLoading[leave._id] === 'Rejected' ? <span className="btn-spinner" /> : <XCircle size={13} />} Reject
                                                        </button>
                                                    </>
                                                ) : <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>—</span>}
                                                <button onClick={() => { setSelectedLeave(leave); setShowView(true); }} className="btn btn-sm" style={{ gap: '0.3rem', background: '#EFF6FF', borderColor: '#DBEAFE', color: '#1D4ED8' }}><Eye size={13} /> View</button>
                                                <button onClick={() => downloadLeaveApplicationPDF(leave)} className="btn btn-sm" style={{ gap: '0.3rem', background: '#EFF6FF', borderColor: '#93C5FD', color: '#1D4ED8' }}><Download size={13} /> PDF</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan="6" className="empty-state"><Calendar size={40} /><p>No leave requests found</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {showView && selectedLeave && <LeaveViewModal leave={selectedLeave} onClose={() => { setShowView(false); setSelectedLeave(null); }} />}
            {rejectLeave && <RejectModal leave={rejectLeave} onConfirm={handleReject} onClose={() => setRejectLeave(null)} />}
        </div>
    );
};

export default LeaveApprovals;
