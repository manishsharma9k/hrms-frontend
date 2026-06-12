import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Clock, Search, X, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { attendanceAdminAPI } from '../../services/api';
import PageLoader from '../../components/PageLoader';

const AttendanceAdmin = () => {
    const { } = useContext(AuthContext);
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    useEffect(() => {
        attendanceAdminAPI.getToday()
            .then(r => setRecords(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = records.filter(r =>
        (r.employee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.employee?.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount  = records.filter(r => r.status === 'Absent').length;
    const leaveCount   = records.filter(r => r.status === 'On Leave').length;
    const rate = records.length ? Math.round((presentCount / records.length) * 100) : 0;

    const statusCfg = {
        Present:    { cls: 'badge-success', icon: <CheckCircle size={11} /> },
        Absent:     { cls: 'badge-danger',  icon: <XCircle size={11} /> },
        'On Leave': { cls: 'badge-warning', icon: <AlertCircle size={11} /> },
    };

    if (loading) return <PageLoader text="Loading attendance..." />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                        <h2 className="page-title"><Clock size={20} color="#EC4899" /> Attendance Tracking</h2>
                    </div>
                    <p className="page-subtitle">{today}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid-4">
                {[
                    { label: 'Present', value: presentCount, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                    { label: 'Absent', value: absentCount, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
                    { label: 'On Leave', value: leaveCount, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
                    { label: 'Total', value: records.length, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.2)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '0.875rem', padding: '1.25rem', border: `1px solid ${s.border}` }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                        <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Attendance Rate */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>Today's Attendance Rate</p>
                    <span style={{ fontWeight: 800, color: rate >= 80 ? '#10B981' : '#F59E0B', fontSize: '0.875rem' }}>{rate}%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${rate}%`, background: rate >= 80 ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#F59E0B,#D97706)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>0%</span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>100%</span>
                </div>
            </div>

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="search-bar" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search size={15} color="#94A3B8" />
                        <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}><X size={14} /></button>}
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                                <thead>
                                    <tr><th>Employee</th><th>ID</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr>
                                </thead>
                        <tbody>
                            {filtered.map((r) => {
                                const cfg = statusCfg[r.status] || statusCfg.Absent;
                                const checkIn  = r.checkIn  ? new Date(r.checkIn).toLocaleTimeString('en-IN',  { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
                                const checkOut = r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
                                const hours = r.checkIn && r.checkOut
                                    ? `${((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000).toFixed(1)}h`
                                    : '--';
                                return (
                                    <tr key={r._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar avatar-sm" style={{ background: `hsl(${(r.employee?.name||'A').charCodeAt(0) * 10},65%,55%)` }}>{(r.employee?.name||'A').charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{r.employee?.name || '—'}</p>
                                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{r.employee?.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#374151' }}>{r.employee?.employeeId || '—'}</td>
                                        <td><span className="badge badge-info">{r.employee?.department?.name || 'N/A'}</span></td>
                                        <td style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{checkIn}</td>
                                        <td style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{checkOut}</td>
                                        <td style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>{hours}</td>
                                        <td><span className={`badge ${cfg.cls}`}>{cfg.icon} {r.status}</span></td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan="7" className="empty-state"><Clock size={40} /><p>No attendance records today</p></td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAdmin;
