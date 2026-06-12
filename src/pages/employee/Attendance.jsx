import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CheckSquare, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { attendanceAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
    const { } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchAttendance = async () => {
        try { const res = await attendanceAPI.getMyAttendance(); setAttendance(res.data.data); }
        catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchAttendance(); }, []);

    const todayRecord = attendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    const leaveDays = attendance.filter(a => a.status === 'On Leave').length;
    const rate = attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0;

    const filtered = filter === 'All' ? attendance : attendance.filter(a => a.status === filter);

    const statusCfg = {
        Present:  { cls: 'badge-success', icon: <CheckCircle size={12} />, color: '#10B981' },
        Absent:   { cls: 'badge-danger',  icon: <XCircle size={12} />,    color: '#EF4444' },
        'On Leave': { cls: 'badge-warning', icon: <AlertCircle size={12} />, color: '#F59E0B' },
    };

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={20} color="#10B981" /> My Attendance</h2>
                    <p className="page-subtitle">Track your daily attendance and work hours</p>
                </div>
            </div>

            {/* Today Status */}
            <div style={{ background: todayRecord ? (todayRecord.status === 'Present' ? 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))' : 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))') : 'linear-gradient(135deg,rgba(79,70,229,0.06),rgba(124,58,237,0.04))', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: `1px solid ${todayRecord ? (todayRecord.status === 'Present' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(79,70,229,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: todayRecord ? (todayRecord.status === 'Present' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {todayRecord ? (todayRecord.status === 'Present' ? <CheckCircle size={22} color="#10B981" /> : <XCircle size={22} color="#EF4444" />) : <Clock size={22} color="#4F46E5" />}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        {todayRecord ? (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Status: {todayRecord.status}</span>
                                {todayRecord.checkIn && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>In: {new Date(todayRecord.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                {todayRecord.checkOut && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Out: {new Date(todayRecord.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                {todayRecord.checkIn && todayRecord.checkOut && <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600 }}>Total: {Math.round((new Date(todayRecord.checkOut) - new Date(todayRecord.checkIn)) / 3600000 * 10) / 10}h</span>}
                            </div>
                        ) : <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>Not marked yet — use Check In from dashboard</p>}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.875rem' }}>
                {[
                    { label: 'Present', value: presentDays, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                    { label: 'Absent', value: absentDays, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
                    { label: 'On Leave', value: leaveDays, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Total Days', value: attendance.length, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '0.875rem', padding: '1rem', border: `1px solid ${s.color}25` }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Rate Bar */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><TrendingUp size={15} color="#4F46E5" /> Attendance Rate</p>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: rate >= 80 ? '#10B981' : '#F59E0B' }}>{rate}%</span>
                </div>
                <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rate}%`, background: rate >= 80 ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#F59E0B,#D97706)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#94A3B8' }}>{rate >= 80 ? '✅ Great attendance! Keep it up.' : '⚠️ Attendance below 80%. Try to improve.'}</p>
            </div>

            {/* Filter + Records */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Present', 'Absent', 'On Leave'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.35rem 0.875rem', borderRadius: '9999px', border: '1.5px solid', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        background: filter === f ? (f === 'Present' ? '#D1FAE5' : f === 'Absent' ? '#FEE2E2' : f === 'On Leave' ? '#FEF3C7' : '#EDE9FE') : '#fff',
                        color: filter === f ? (f === 'Present' ? '#065F46' : f === 'Absent' ? '#991B1B' : f === 'On Leave' ? '#92400E' : '#5B21B6') : '#64748B',
                        borderColor: filter === f ? 'currentColor' : '#E2E8F0'
                    }}>{f}</button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
                        <Calendar size={40} color="#CBD5E1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                        <p style={{ color: '#94A3B8', fontWeight: 500 }}>No records found</p>
                    </div>
                )}
                {filtered.map(r => {
                    const cfg = statusCfg[r.status] || statusCfg.Absent;
                    const duration = r.checkIn && r.checkOut ? Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000 * 10) / 10 : null;
                    return (
                        <div key={r._id} style={{ background: '#fff', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '0.625rem', background: `${cfg.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: cfg.color }}>
                                <Calendar size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <div style={{ display: 'flex', gap: '0.875rem', marginTop: '0.2rem' }}>
                                    {r.checkIn && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>In: {new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                    {r.checkOut && <span style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 600 }}>Out: {new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                    {duration && <span style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 600 }}>{duration}h worked</span>}
                                </div>
                            </div>
                            <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>{cfg.icon} {r.status}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Attendance;
