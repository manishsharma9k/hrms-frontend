import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { IndianRupee, FileText, CheckCircle, XCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import { salaryAPI } from '../../services/api';
import { calcDeductions } from '../../utils/slipUtils';
import SlipModal from '../../components/SlipModal';

const SalaryDetails = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSlip, setShowSlip] = useState(false);

    useEffect(() => {
        salaryAPI.getMySalary()
            .then(res => setData(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    const {
        salary = 0, presentDays = 0, absentDays = 0, leaveDays = 0,
        earnedSalary = 0, perDay = 0, workingDaysElapsed = 0
    } = data || {};

    const d = calcDeductions(earnedSalary);
    const progressPct = workingDaysElapsed > 0 ? Math.min(100, Math.round((presentDays / workingDaysElapsed) * 100)) : 0;
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {showSlip && data && (
                <SlipModal
                    emp={{ name: user?.name, email: user?.email, department: data.department, salary, presentDays }}
                    onClose={() => setShowSlip(false)}
                />
            )}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IndianRupee size={20} color="#8B5CF6" /> Salary Details
                    </h2>
                    <p className="page-subtitle">Your earnings for {month} — updates daily with attendance</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowSlip(true)} disabled={!salary}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', opacity: !salary ? 0.5 : 1 }}>
                    <FileText size={15} /> Download Payslip
                </button>
            </div>

            {/* Earned Salary Hero Card */}
            <div style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', borderRadius: '1.25rem', padding: '1.5rem 2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Earned This Month
                    </p>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', color: '#ffffff' }}>
                        ₹{earnedSalary.toLocaleString('en-IN')}
                    </h1>
                    <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                        Based on {presentDays} present day{presentDays !== 1 ? 's' : ''} × ₹{perDay.toLocaleString('en-IN')}/day
                    </p>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)' }}>
                        <span>{presentDays} / {workingDaysElapsed} working days attended</span>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{progressPct}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#A78BFA,#ffffff)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross CTC</p>
                            <p style={{ margin: '0.1rem 0 0', fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>₹{salary.toLocaleString('en-IN')}/mo</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Per Day</p>
                            <p style={{ margin: '0.1rem 0 0', fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>₹{perDay.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Take-Home</p>
                            <p style={{ margin: '0.1rem 0 0', fontWeight: 700, fontSize: '0.95rem', color: '#A7F3D0' }}>₹{d.netSalary.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.875rem' }}>
                {[
                    { icon: <CheckCircle size={18} />, label: 'Present Days', value: presentDays, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                    { icon: <XCircle size={18} />, label: 'Absent Days', value: absentDays, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
                    { icon: <Calendar size={18} />, label: 'Leave Days', value: leaveDays, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
                    { icon: <Clock size={18} />, label: 'Days Elapsed', value: workingDaysElapsed, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.2)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: `1px solid ${s.border}` }}>
                        <div style={{ background: s.bg, padding: '0.5rem', borderRadius: '0.5rem', color: s.color, display: 'inline-flex', marginBottom: '0.5rem' }}>{s.icon}</div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{s.label}</p>
                        <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Earnings + Deductions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TrendingUp size={15} color="#10B981" /> Earnings Breakdown
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { label: 'Gross CTC (Monthly)', value: `₹${salary.toLocaleString('en-IN')}`, color: '#4F46E5', bold: true },
                            { label: `Earned (${presentDays} days × ₹${perDay.toLocaleString('en-IN')})`, value: `₹${earnedSalary.toLocaleString('en-IN')}`, color: '#8B5CF6', bold: true },
                            { label: 'Basic (40%)', value: `₹${Math.round(earnedSalary * 0.4).toLocaleString('en-IN')}`, color: '#64748B' },
                            { label: 'HRA (20%)', value: `₹${Math.round(earnedSalary * 0.2).toLocaleString('en-IN')}`, color: '#64748B' },
                            { label: 'Special Allowance (30%)', value: `₹${Math.round(earnedSalary * 0.3).toLocaleString('en-IN')}`, color: '#64748B' },
                            { label: 'Other Allowances (10%)', value: `₹${Math.round(earnedSalary * 0.1).toLocaleString('en-IN')}`, color: '#64748B' },
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{row.label}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: row.bold ? 700 : 600, color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <IndianRupee size={15} color="#EF4444" /> Deductions
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'PF (Employee @ 12%)', value: `-₹${d.pf.toLocaleString('en-IN')}`, color: '#EF4444' },
                            { label: 'PF (Employer @ 12%)', value: `₹${d.pfEmployer.toLocaleString('en-IN')}`, color: '#10B981', note: 'benefit' },
                            { label: `ESI ${salary <= 21000 ? '@ 0.75%' : '(Not Applicable)'}`, value: d.esi > 0 ? `-₹${d.esi.toLocaleString('en-IN')}` : '—', color: d.esi > 0 ? '#EF4444' : '#94A3B8' },
                            { label: 'TDS (Income Tax)', value: d.tds > 0 ? `-₹${d.tds.toLocaleString('en-IN')}` : '—', color: d.tds > 0 ? '#EF4444' : '#94A3B8' },
                            { label: 'Professional Tax', value: d.professional > 0 ? `-₹${d.professional.toLocaleString('en-IN')}` : '—', color: d.professional > 0 ? '#8B5CF6' : '#94A3B8' },
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                    {row.label}
                                    {row.note && <span style={{ fontSize: '0.62rem', background: '#D1FAE5', color: '#065F46', padding: '1px 5px', borderRadius: '9999px', marginLeft: '0.3rem' }}>{row.note}</span>}
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '0.875rem', background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))', borderRadius: '0.625rem', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Net Take-Home</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10B981' }}>₹{d.netSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowSlip(true)} disabled={!salary}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', opacity: !salary ? 0.5 : 1 }}>
                        <FileText size={16} /> Download Payslip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryDetails;
