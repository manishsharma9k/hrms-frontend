import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, CheckCircle, Clock, IndianRupee, ArrowUpRight, TrendingUp, UserCircle, XCircle, LogOut, Zap, ChevronRight, Download, Eye } from 'lucide-react';
import HolidayCalendar from '../../components/HolidayCalendar';
import LeaveViewModal from '../../components/LeaveViewModal';
import toast from 'react-hot-toast';
import { downloadLeaveApprovalPDF } from '../../utils/leavePdfUtils';

const formatDuration = (ms) => {
    if (!ms || ms < 0) return '0m';
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

const EmployeeDashboard = () => {
    const { user, api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [salary, setSalary] = useState(null);
    const [todayRecord, setTodayRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    const [checkInLoading, setCheckInLoading] = useState(false);
    const [checkOutLoading, setCheckOutLoading] = useState(false);

    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

    const fetchAll = async () => {
        try {
            const [attRes, leaveRes, salRes] = await Promise.all([
                api.get('/employee/attendance'), api.get('/employee/leave'), api.get('/employee/salary'),
            ]);
            const recs = attRes.data.data;
            setAttendance(recs); setLeaves(leaveRes.data.data); setSalary(salRes.data.data);
            setTodayRecord(recs.find(r => new Date(r.date).toDateString() === new Date().toDateString()) || null);
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleCheckIn = async () => {
        setCheckInLoading(true);
        try {
            // Get fresh live location at check-in time
            const getLiveLocation = () => new Promise((resolve) => {
                if (!navigator.geolocation) { resolve(null); return; }
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        try {
                            const res = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
                                { headers: { 'Accept-Language': 'en' } }
                            );
                            const data = await res.json();
                            const a = data.address || {};
                            address = [
                                a.road || a.pedestrian || a.footway || a.path || '',
                                a.suburb || a.neighbourhood || a.quarter || a.village || a.county || '',
                                a.city || a.town || a.district || '',
                                a.state || '',
                                a.postcode || '',
                            ].filter(Boolean).join(', ') || address;
                        } catch {}
                        resolve({ lat: lat.toFixed(6), lng: lng.toFixed(6), address });
                    },
                    () => resolve(null),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                );
            });

            const loc = await getLiveLocation();
            await api.post('/employee/attendance', {
                status: 'Present',
                location: loc ? { lat: loc.lat, lng: loc.lng, address: loc.address } : {}
            });
            if (loc) localStorage.setItem('loginLocation', JSON.stringify(loc));
            toast.success('Checked in successfully! 🎉');
            fetchAll();
        } catch { toast.error('Already checked in today'); }
        finally { setCheckInLoading(false); }
    };
    const handleCheckOut = async () => {
        setCheckOutLoading(true);
        try { await api.put('/employee/attendance/checkout'); toast.success('Checked out. Have a great evening! 👋'); fetchAll(); }
        catch (err) { toast.error(err.response?.data?.error || 'Failed to check out'); }
        finally { setCheckOutLoading(false); }
    };

    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const netSalary = Math.round(((salary?.salary || 0) / 26) * presentDays);
    const checkInTime = todayRecord?.checkIn ? new Date(todayRecord.checkIn) : null;
    const checkOutTime = todayRecord?.checkOut ? new Date(todayRecord.checkOut) : null;
    const workDuration = checkInTime ? (checkOutTime ? checkOutTime - checkInTime : now - checkInTime) : null;
    const attendanceRate = attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0;
    const latestApprovedLeave = [...leaves].filter(l => l.status === 'Approved').sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))[0];
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    const handleDownloadLatestLeavePDF = () => {
        if (!latestApprovedLeave) {
            toast.error('No approved leave found to download.');
            return;
        }
        downloadLeaveApprovalPDF(latestApprovedLeave, user);
    };

    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showView, setShowView] = useState(false);

    const handleViewLatest = () => {
        if (!latestApprovedLeave) { toast.error('No approved leave to view'); return; }
        setSelectedLeave(latestApprovedLeave); setShowView(true);
    };

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Hero Header — NO overflow:hidden so dropdown is never clipped ── */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#EC4899 100%)', borderRadius: '1.25rem', padding: '1.5rem', color: '#fff', position: 'relative' }}>
                {/* decorative circles — pointerEvents:none so they don't block clicks */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-50px', left: '35%', width: '140px', height: '140px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Top row */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.875rem' }}>
                    {/* Left: avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {user?.photo
                                ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>{greeting} 👋</p>
                            <h2 style={{ margin: '0.1rem 0', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>{user?.name}</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{user?.designation || 'Employee'} · {user?.department?.name || 'N/A'}</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>ID: {user?.employeeId || '—'}</p>
                        </div>
                    </div>

                    {/* Right: clock + holiday + checkin */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                                {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </span>
                        </div>

                        {/* HolidayCalendar — wrapped in a div that does NOT clip */}
                        <HolidayCalendar isAdmin={false} />

                        {!todayRecord ? (
                            <button onClick={handleCheckIn} disabled={checkInLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.875rem', background: checkInLoading ? 'rgba(16,185,129,0.6)' : '#10B981', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: checkInLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                                {checkInLoading ? <><span className="btn-spinner" /> Getting location...</> : <><CheckCircle size={14} /> Check In</>}
                            </button>
                        ) : !checkOutTime ? (
                            <button onClick={handleCheckOut} disabled={checkOutLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.875rem', background: checkOutLoading ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: checkOutLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                                {checkOutLoading ? <><span className="btn-spinner" /> Checking out...</> : <><LogOut size={14} /> Check Out</>}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.875rem', background: 'rgba(255,255,255,0.15)', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                <CheckCircle size={13} /> Done for Today
                            </div>
                        )}
                    </div>
                </div>

                {/* Today session row */}
                {todayRecord && (
                    <div style={{ position: 'relative', zIndex: 1, marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        {checkInTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <CheckCircle size={13} color="#10B981" />
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check In</p>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', fontFamily: 'monospace' }}>{checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>
                            </div>
                        )}
                        {checkOutTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <LogOut size={13} color="#FCA5A5" />
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check Out</p>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', fontFamily: 'monospace' }}>{checkOutTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>
                            </div>
                        )}
                        {workDuration && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <Clock size={13} color="#A5B4FC" />
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{checkOutTime ? 'Total Time' : 'Active'}</p>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', fontFamily: 'monospace' }}>{formatDuration(workDuration)}</p>
                                </div>
                            </div>
                        )}
                        {!checkOutTime && checkInTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'rgba(16,185,129,0.3)', borderRadius: '9999px', border: '1px solid rgba(16,185,129,0.5)', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite', flexShrink: 0 }} />
                                Currently Working
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── 4 Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.875rem' }}>
                {[
                    { label: 'Present Days', value: presentDays, sub: `${attendanceRate}% rate`, icon: <CheckCircle size={18} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                    { label: 'Absent Days', value: absentDays, sub: 'This month', icon: <XCircle size={18} />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                    { label: 'Leave Pending', value: pendingLeaves, sub: `${approvedLeaves} approved`, icon: <Calendar size={18} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                    { label: 'Net Salary', value: `₹${netSalary.toLocaleString('en-IN')}`, sub: 'This month', icon: <IndianRupee size={18} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '1rem', padding: '1.125rem', border: `1px solid ${s.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ background: s.bg, padding: '0.55rem', borderRadius: '0.5rem', color: s.color, display: 'inline-flex', marginBottom: '0.625rem' }}>{s.icon}</div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{s.label}</p>
                        <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{s.value}</h3>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.65rem', color: s.color, fontWeight: 600 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Attendance Progress + Quick Actions ── responsive grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
                {/* Attendance */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <TrendingUp size={15} color="#4F46E5" /> My Attendance
                        </p>
                        <button onClick={() => navigate('/employee/attendance')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            View <ArrowUpRight size={12} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Attendance Rate</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: attendanceRate >= 80 ? '#10B981' : '#F59E0B' }}>{attendanceRate}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ height: '100%', width: `${attendanceRate}%`, background: attendanceRate >= 80 ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#F59E0B,#D97706)', borderRadius: '9999px', transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        {[{ l: 'Present', v: presentDays, c: '#10B981' }, { l: 'Absent', v: absentDays, c: '#EF4444' }, { l: 'Total', v: attendance.length, c: '#4F46E5' }].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>{s.l}</p>
                                <p style={{ margin: '0.1rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: s.c }}>{s.v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Zap size={15} color="#F59E0B" /> Quick Actions
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { label: 'My Profile', sub: 'View & edit details', icon: UserCircle, path: '/employee/profile', color: '#4F46E5' },
                            { label: 'Apply Leave', sub: 'Submit leave request', icon: Calendar, path: '/employee/leaves', color: '#F59E0B' },
                            { label: 'Attendance', sub: 'Check-in history', icon: Clock, path: '/employee/attendance', color: '#10B981' },
                            { label: 'Salary Slip', sub: 'Download payslip', icon: IndianRupee, path: '/employee/salary', color: '#8B5CF6' },
                            { label: 'Leave Approval Letter', sub: 'Download approved leave letter', icon: Download, onClick: handleDownloadLatestLeavePDF, color: '#F59E0B' },
                        ].map((a, i) => {
                            const Icon = a.icon;
                            if (a.label === 'Leave Approval Letter') {
                                return (
                                    <div key={i} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                        <button onClick={handleViewLatest} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '0.625rem', cursor: 'pointer', flex: 1 }}>
                                            <Eye size={14} /> View Latest Letter
                                        </button>
                                        <button onClick={handleDownloadLatestLeavePDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '0.625rem', cursor: 'pointer' }}>
                                            <Download size={14} /> Download
                                        </button>
                                    </div>
                                );
                            }
                            return (
                                <button key={i} onClick={() => a.onClick ? a.onClick() : navigate(a.path)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.625rem', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '0.625rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.borderColor = `${a.color}30`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#F1F5F9'; }}>
                                    <div style={{ background: `${a.color}15`, padding: '0.4rem', borderRadius: '0.5rem', color: a.color, flexShrink: 0 }}><Icon size={14} /></div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{a.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.65rem', color: '#94A3B8' }}>{a.sub}</p>
                                    </div>
                                    <ChevronRight size={13} color="#CBD5E1" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Recent Attendance + Leave Requests — responsive ── */}
            {showView && selectedLeave && <LeaveViewModal leave={selectedLeave} employee={user} onClose={() => { setShowView(false); setSelectedLeave(null); }} />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Recent Attendance</p>
                        <button onClick={() => navigate('/employee/attendance')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>View all</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {attendance.slice(0, 5).map(r => (
                            <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.625rem', background: '#F8FAFC', borderRadius: '0.5rem' }}>
                                <div style={{ minWidth: 0 }}>
                                    <span style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 500 }}>{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                                    {r.checkIn && <span style={{ fontSize: '0.62rem', color: '#10B981', marginLeft: '0.4rem' }}>{new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                </div>
                                
                                <span className={`badge ${r.status === 'Present' ? 'badge-success' : r.status === 'Absent' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>{r.status}</span>
                            </div>
                        ))}
                        {attendance.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No records yet</p>}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>My Leave Requests</p>
                        <button onClick={() => navigate('/employee/leaves')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>View all</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {leaves.slice(0, 5).map(l => (
                            <div key={l._id} style={{ padding: '0.5rem 0.625rem', background: '#F8FAFC', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {new Date(l.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(l.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>{l.status}</span>
                                </div>
                                <p style={{ margin: '0.15rem 0 0', fontSize: '0.68rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</p>
                            </div>
                        ))}
                        {leaves.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No leave requests</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
