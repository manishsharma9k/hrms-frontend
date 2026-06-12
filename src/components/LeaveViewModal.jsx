import React from 'react';
import { X, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { downloadLeaveApprovalPDF, downloadLeaveRejectionPDF, downloadLeaveApplicationPDF } from '../utils/leavePdfUtils';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const LeaveViewModal = ({ leave, employee = {}, onClose }) => {
    if (!leave) return null;
    const name = employee?.name || leave.employee?.name || 'Employee';
    const id = employee?.employeeId || leave.employee?.employeeId || '—';
    const email = employee?.email || leave.employee?.email || '—';
    const dept = employee?.department?.name || leave.employee?.department?.name || '—';
    const days = leave.startDate && leave.endDate ? Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1 : '—';
    const emp = employee?.name ? employee : leave.employee || {};

    const statusColor = leave.status === 'Approved' ? '#10B981' : leave.status === 'Rejected' ? '#EF4444' : '#F59E0B';
    const statusBg = leave.status === 'Approved' ? '#ECFDF5' : leave.status === 'Rejected' ? '#FFF1F2' : '#FFFBEB';
    const StatusIcon = leave.status === 'Approved' ? CheckCircle : leave.status === 'Rejected' ? XCircle : Clock;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose && onClose()}>
            <div className="modal-box" style={{ maxWidth: 580, padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Leave Application</h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>{name} · {days} day{days === 1 ? '' : 's'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.375rem', padding: '0.3rem', cursor: 'pointer', display: 'flex', color: '#fff' }}><X size={18} /></button>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', background: statusBg, borderRadius: '0.625rem', border: `1px solid ${statusColor}30` }}>
                        <StatusIcon size={18} color={statusColor} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: statusColor }}>Status: {leave.status}</span>
                    </div>

                    {/* Employee + Leave Period */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</p>
                            <p style={{ margin: '0.4rem 0 0', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{name}</p>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>{id}</p>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#475569' }}>{dept}</p>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Leave Period</p>
                            <p style={{ margin: '0.4rem 0 0', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{formatDate(leave.startDate)}</p>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#475569' }}>to {formatDate(leave.endDate)}</p>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600 }}>{days} day{days === 1 ? '' : 's'}</p>
                        </div>
                    </div>

                    {/* Leave Reason */}
                    <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason for Leave</p>
                        <p style={{ margin: '0.4rem 0 0', color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>{leave.reason || '—'}</p>
                    </div>

                    {/* Rejection Reason */}
                    {leave.status === 'Rejected' && leave.rejectionReason && (
                        <div style={{ background: '#FFF1F2', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5' }}>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#991B1B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</p>
                            <p style={{ margin: '0.4rem 0 0', color: '#991B1B', fontSize: '0.875rem', lineHeight: 1.6 }}>{leave.rejectionReason}</p>
                        </div>
                    )}

                    {/* Download Buttons */}
                    <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid #F1F5F9' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '0.6rem', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Close</button>
                        {leave.status === 'Approved' && (
                            <button onClick={() => downloadLeaveApprovalPDF(leave, emp)} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', background: '#10B981', border: 'none', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                                <Download size={14} /> Download Approval Letter
                            </button>
                        )}
                        {leave.status === 'Rejected' && (
                            <button onClick={() => downloadLeaveRejectionPDF(leave, emp)} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', background: '#EF4444', border: 'none', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                                <Download size={14} /> Download Rejection Letter
                            </button>
                        )}
                        {leave.status === 'Pending' && (
                            <button onClick={() => downloadLeaveApplicationPDF(leave, emp)} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', background: '#F59E0B', border: 'none', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                                <Download size={14} /> Download Application
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveViewModal;
