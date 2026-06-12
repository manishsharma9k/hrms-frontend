import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Mail, Building2, DollarSign, Calendar, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { employeesAPI } from '../../services/api';
import SlipModal from '../../components/SlipModal';
import PageLoader from '../../components/PageLoader';

const EmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSlip, setShowSlip] = useState(false);

    useEffect(() => {
        employeesAPI.getById(id)
            .then(res => setData(res.data.data))
            .catch(() => navigate(-1))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDownloadSlip = () => setShowSlip(true);

    if (loading) return <PageLoader text="Loading employee profile..." />;
    if (!data) return null;

    const { employee, attendance, presentDays, absentDays, leaveDays, totalDays, leaves } = data;
    const perDay = (employee.salary || 0) / 26;
    const netSalary = Math.round(perDay * presentDays);

    const statBox = (icon, label, value, color) => (
        <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    {React.cloneElement(icon, { size: 20, color })}
                </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{label}</p>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{value}</h3>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {showSlip && <SlipModal emp={{ ...employee, presentDays }} onClose={() => setShowSlip(false)} />}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm"><ArrowLeft size={15} /> Back</button>
                    <div>
                        <h2 className="page-title">Employee Profile</h2>
                        <p className="page-subtitle">Full details, attendance & salary</p>
                    </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleDownloadSlip}><FileText size={15} /> Download Salary Slip</button>
            </div>

            {/* Employee Info */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', background: `hsl(${employee.name.charCodeAt(0) * 10},65%,55%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                        {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>{employee.name}</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748B' }}>ID: <strong style={{ color: '#0F172A', marginLeft: '0.25rem' }}>{employee.employeeId || '—'}</strong></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748B' }}><Mail size={13} />{employee.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748B' }}><Building2 size={13} />{employee.department?.name || 'N/A'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700 }}><FileText size={13} />{employee.technology || '—'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}><DollarSign size={13} />₹{(employee.salary || 0).toLocaleString('en-IN')} / month</span>
                        </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Active</span>
                </div>
            </div>

            {/* Attendance Stats */}
            <div className="grid-auto">
                {statBox(<CheckCircle />, 'Present Days', presentDays, '#10B981')}
                {statBox(<XCircle />, 'Absent Days', absentDays, '#EF4444')}
                {statBox(<Calendar />, 'Leave Days', leaveDays, '#F59E0B')}
                {statBox(<Clock />, 'Total Records', totalDays, '#4F46E5')}
            </div>

            {/* Salary Summary */}
            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg,rgba(79,70,229,0.04),rgba(16,185,129,0.04))' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={16} color="#4F46E5" /> Salary Calculation (Based on Attendance)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Gross Salary', value: `₹${(employee.salary||0).toLocaleString('en-IN')}`, color: '#4F46E5' },
                        { label: 'Working Days (Standard)', value: '26 days', color: '#64748B' },
                        { label: 'Per Day Rate', value: `₹${Math.round(perDay).toLocaleString('en-IN')}`, color: '#64748B' },
                        { label: 'Days Present', value: `${presentDays} days`, color: '#10B981' },
                        { label: 'Deduction (Absent)', value: `- ₹${((employee.salary||0) - netSalary).toLocaleString('en-IN')}`, color: '#EF4444' },
                        { label: 'Net Salary', value: `₹${netSalary.toLocaleString('en-IN')}`, color: '#10B981' },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: '0.875rem', background: '#fff', borderRadius: '0.625rem', border: '1px solid #F1F5F9' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 800, color: item.color }}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Attendance & Leave History */}
            <div className="grid-2">
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Recent Attendance</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '280px', overflowY: 'auto' }}>
                        {attendance.slice(0, 15).map(a => (
                            <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.625rem', background: '#F8FAFC', borderRadius: '0.375rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#0F172A' }}>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className={`badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span>
                            </div>
                        ))}
                        {attendance.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No attendance records</p>}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Leave History</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '280px', overflowY: 'auto' }}>
                        {leaves.slice(0, 10).map(l => (
                            <div key={l._id} style={{ padding: '0.5rem 0.625rem', background: '#F8FAFC', borderRadius: '0.375rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{new Date(l.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(l.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                    <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                                </div>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#64748B' }}>{l.reason}</p>
                            </div>
                        ))}
                        {leaves.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No leave records</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
