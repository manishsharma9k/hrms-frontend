import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, Award, Target, ArrowLeft, Users, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeesAPI, attendanceAdminAPI, leavesAdminAPI } from '../../services/api';

const StarRating = ({ value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={13} fill={s <= Math.round(value) ? '#F59E0B' : 'none'} color={s <= Math.round(value) ? '#F59E0B' : '#D1D5DB'} />
        ))}
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginLeft: '0.25rem' }}>{value.toFixed(1)}</span>
    </div>
);

const Performance = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [attendanceAll, setAttendanceAll] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            employeesAPI.getAll(),
            attendanceAdminAPI.getAll(),
            leavesAdminAPI.getAll(),
        ]).then(([empRes, attRes, leaveRes]) => {
            setEmployees(empRes.data.data || []);
            setAttendanceAll(attRes.data.data || []);
            setLeaves(leaveRes.data.data || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    // Compute per-employee stats from real attendance data
    const empStats = employees.map(emp => {
        const empAtt = attendanceAll.filter(a => a.employee?._id === emp._id || a.employee === emp._id);
        const present = empAtt.filter(a => a.status === 'Present').length;
        const total = empAtt.length || 1;
        const attendanceRate = Math.round((present / total) * 100);

        // Derive a performance rating from attendance rate (real metric)
        const rating = Math.min(5, Math.max(1, (attendanceRate / 100) * 5)).toFixed(1);

        // Goal completion = attendance rate (real proxy)
        const goal = attendanceRate;

        // Review label based on rating
        const review = attendanceRate >= 90 ? 'Outstanding'
            : attendanceRate >= 75 ? 'Excellent'
            : attendanceRate >= 60 ? 'Good'
            : 'Needs Improvement';

        const empLeaves = leaves.filter(l => l.employee?._id === emp._id || l.employee === emp._id);
        const approvedLeaves = empLeaves.filter(l => l.status === 'Approved').length;

        return { emp, present, total, attendanceRate, rating: parseFloat(rating), goal, review, approvedLeaves };
    });

    const avgRating = empStats.length ? (empStats.reduce((s, e) => s + e.rating, 0) / empStats.length).toFixed(1) : 0;
    const topPerformers = empStats.filter(e => e.attendanceRate >= 90).length;
    const avgGoal = empStats.length ? Math.round(empStats.reduce((s, e) => s + e.goal, 0) / empStats.length) : 0;

    const getReviewBadge = r => ({ 'Outstanding': 'badge-success', 'Excellent': 'badge-info', 'Good': 'badge-purple', 'Needs Improvement': 'badge-warning' }[r] || 'badge-warning');

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
                        <h2 className="page-title"><TrendingUp size={20} color="#F97316" /> Performance Analytics</h2>
                    </div>
                    <p className="page-subtitle">Real attendance-based performance metrics for all employees</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                {[
                    { label: 'Avg. Performance Rating', value: `${avgRating}/5`, icon: <Star size={20} color="#F59E0B" />, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#F59E0B' },
                    { label: 'Top Performers (≥90%)', value: topPerformers, icon: <Award size={20} color="#10B981" />, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10B981' },
                    { label: 'Avg. Attendance Rate', value: `${avgGoal}%`, icon: <Target size={20} color="#4F46E5" />, bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.2)', color: '#4F46E5' },
                    { label: 'Total Employees', value: employees.length, icon: <Users size={20} color="#8B5CF6" />, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', color: '#8B5CF6' },
                ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, borderRadius: '0.875rem', padding: '1.25rem', border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>{s.label}</p>
                            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Table */}
            <div className="table-wrapper">
                <div className="table-toolbar">
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Employee Performance Overview</p>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Based on real attendance data</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Present Days</th>
                                <th>Attendance Rate</th>
                                <th>Rating</th>
                                <th>Leaves Taken</th>
                                <th>Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empStats.map(({ emp, present, total, attendanceRate, rating, review, approvedLeaves }) => (
                                <tr key={emp._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="avatar avatar-sm" style={{ background: `hsl(${emp.name.charCodeAt(0) * 10},65%,55%)` }}>{emp.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{emp.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-info">{emp.department?.name || 'N/A'}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <CheckCircle size={13} color="#10B981" />
                                            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>{present}</span>
                                            <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>/ {total}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                            <div className="progress-bar" style={{ height: '6px', flex: 1, minWidth: '70px' }}>
                                                <div className="progress-fill" style={{ width: `${attendanceRate}%`, background: attendanceRate >= 90 ? '#10B981' : attendanceRate >= 75 ? '#4F46E5' : '#F59E0B' }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', minWidth: '36px' }}>{attendanceRate}%</span>
                                        </div>
                                    </td>
                                    <td><StarRating value={rating} /></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={13} color="#F59E0B" />
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>{approvedLeaves}</span>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${getReviewBadge(review)}`}>{review}</span></td>
                                </tr>
                            ))}
                            {empStats.length === 0 && (
                                <tr><td colSpan="7" className="empty-state"><TrendingUp size={40} /><p>No employee data available</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Performance;
