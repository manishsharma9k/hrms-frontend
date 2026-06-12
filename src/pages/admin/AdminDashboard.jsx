import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { dashboardAPI, employeesAPI, attendanceAdminAPI, leavesAdminAPI, departmentsAPI, notificationsAPI } from '../../services/api';
import { Users, Building2, Calendar, DollarSign, Clock, CheckCircle, XCircle, Briefcase, ArrowUpRight, ArrowDownRight, UserPlus, BarChart2, TrendingUp, Timer, Zap, Edit2, UserCheck, X, Plus, MapPin, Download, Eye } from 'lucide-react';
import HolidayCalendar from '../../components/HolidayCalendar';
import LeaveViewModal from '../../components/LeaveViewModal';
import PageLoader from '../../components/PageLoader';
import toast from 'react-hot-toast';
import { downloadLeaveApplicationPDF } from '../../utils/leavePdfUtils';

const RejectModal = ({ leave, onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const quick = ['Insufficient leave balance', 'Critical project deadline', 'Team understaffed during this period', 'Already approved leave for another team member', 'Medical certificate required'];
    const handleSubmit = async () => {
        if (!reason.trim()) { toast.error('Rejection reason is required'); return; }
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
                    <p style={{ margin: '0 0 0.625rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Quick Reasons</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                        {quick.map((r, i) => (
                            <button key={i} onClick={() => setReason(r)} style={{ padding: '0.3rem 0.625rem', borderRadius: '9999px', border: `1.5px solid ${reason === r ? '#EF4444' : '#E2E8F0'}`, background: reason === r ? '#FEE2E2' : '#F8FAFC', color: reason === r ? '#991B1B' : '#475569', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer' }}>{r}</button>
                        ))}
                    </div>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Reason <span style={{ color: '#EF4444' }}>*</span></p>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter rejection reason..." rows={3} maxLength={300}
                        style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#0F172A' }}
                        onFocus={e => e.target.style.borderColor = '#EF4444'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.68rem', color: '#94A3B8', textAlign: 'right' }}>{reason.length}/300</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', padding: '0 1.5rem 1.25rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.625rem', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading || !reason.trim()}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem', background: reason.trim() ? '#EF4444' : '#FCA5A5', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#fff', cursor: reason.trim() ? 'pointer' : 'not-allowed' }}>
                        {loading ? <><span className="btn-spinner" /> Rejecting...</> : <><XCircle size={14} /> Reject Leave</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reverse geocode lat/lng → full address using OpenStreetMap (free, no key)
const geocodeCache = {};
const reverseGeocode = async (lat, lng) => {
    const key = `${lat},${lng}`;
    if (geocodeCache[key]) return geocodeCache[key];
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const a = data.address || {};
        const parts = [
            a.road || a.pedestrian || a.footway || a.path || '',
            a.suburb || a.neighbourhood || a.quarter || a.village || a.county || '',
            a.city || a.town || a.district || '',
            a.state || '',
            a.postcode || '',
        ].filter(Boolean);
        const name = parts.join(', ') || `${lat}, ${lng}`;
        geocodeCache[key] = { name, display: data.display_name || name };
        return geocodeCache[key];
    } catch { return { name: `${lat}, ${lng}`, display: `${lat}, ${lng}` }; }
};

const StatCard = ({ icon, label, value, change, color, bg, onClick }) => (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: bg, padding: '0.75rem', borderRadius: '0.75rem' }}>
                {React.cloneElement(icon, { size: 20, color })}
            </div>
            {change !== undefined && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', fontWeight: 700, color: change >= 0 ? '#10B981' : '#EF4444', background: change >= 0 ? '#D1FAE5' : '#FEE2E2', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                    {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(change)}%
                </span>
            )}
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>{label}</p>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>{value}</h3>
        </div>
    </div>
);

const formatDuration = (ms) => {
    if (!ms || ms < 0) return '0m';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ employees: 0, departments: 0, pendingLeaves: 0, totalSalary: 0, totalEarnedSalary: 0, presentToday: 0, absentToday: 0 });
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [recentCandidates, setRecentCandidates] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [locationNames, setLocationNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());
    const loginTime = useRef(Date.now());

    // Admin Actions state
    const [allLeaves, setAllLeaves] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [allDepts, setAllDepts] = useState([]);
    const [actionTab, setActionTab] = useState('leaves'); // 'leaves' | 'attendance' | 'employee' | 'salary'
    const [leaveActionLoading, setLeaveActionLoading] = useState({});
    const [attOverride, setAttOverride] = useState({ employeeId: '', status: 'Present', date: new Date().toISOString().slice(0, 10) });
    const [attMsg, setAttMsg] = useState('');
    const [attLoading, setAttLoading] = useState(false);
    const [empForm, setEmpForm] = useState({ name: '', email: '', password: '', department: '', salary: '', technology: '' });
    const [empMsg, setEmpMsg] = useState('');
    const [empLoading, setEmpLoading] = useState(false);
    const [salaryForm, setSalaryForm] = useState({ employeeId: '', salary: '' });
    const [salaryMsg, setSalaryMsg] = useState('');
    const [employeeSearchId, setEmployeeSearchId] = useState('');
    const [employeeSearchResult, setEmployeeSearchResult] = useState(null);
    const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
    const [employeeSearchError, setEmployeeSearchError] = useState('');
    const [salaryLoading, setSalaryLoading] = useState(false);
    // Notifications
    const [notifForm, setNotifForm] = useState({ message: '', type: 'General', link: '', targetAll: true, userIds: [] });
    const [notifMsg, setNotifMsg] = useState('');
    const [notifLoading, setNotifLoading] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showView, setShowView] = useState(false);
    const [rejectLeave, setRejectLeave] = useState(null);

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [statsRes, empRes, attRes, leavesRes, deptsRes] = await Promise.all([
                dashboardAPI.getStats(),
                employeesAPI.getAll(),
                attendanceAdminAPI.getToday(),
                leavesAdminAPI.getAll(),
                departmentsAPI.getAll(),
            ]);
            setStats({
                employees: statsRes.data.data.employees,
                departments: statsRes.data.data.departments,
                pendingLeaves: statsRes.data.data.pendingLeaves,
                totalSalary: statsRes.data.data.totalSalary,
                totalEarnedSalary: statsRes.data.data.totalEarnedSalary || 0,
                presentToday: statsRes.data.data.presentToday,
                absentToday: statsRes.data.data.absentToday
            });
            setRecentLeaves(statsRes.data.data.leaves || []);
            setRecentEmployees(empRes.data.data.slice(0, 5));
            // fetch recent candidates
            try {
                const rec = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/recruitment', { credentials: 'include', headers: { 'Content-Type': 'application/json' } });
                const jr = await rec.json();
                if (jr.success) setRecentCandidates(jr.data.slice(0, 6));
            } catch (e) { /* ignore */ }
            setAllEmployees(empRes.data.data);
            setAllDepts(deptsRes.data.data);
            setAllLeaves((leavesRes.data.data || []).filter(l => l.status === 'Pending'));
            const today = new Date().toDateString();
            const todayRecs = (attRes.data.data || []).filter(a => new Date(a.date).toDateString() === today);
            setTodayAttendance(todayRecs);

            // Reverse geocode locations for today's records
            const names = {};
            await Promise.all(todayRecs.map(async (att) => {
                const { lat, lng, address } = att.location || {};
                if (address) {
                    names[att._id] = { name: address, display: address };
                } else if (lat && lng) {
                    names[att._id] = await reverseGeocode(lat, lng);
                }
            }));
            setLocationNames(names);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLeaveAction = async (id, status, rejectionReason = '') => {
        setLeaveActionLoading(p => ({ ...p, [id]: status }));
        try {
            await leavesAdminAPI.updateStatus(id, { status, rejectionReason });
            setAllLeaves(p => p.filter(l => l._id !== id));
            setStats(p => ({ ...p, pendingLeaves: Math.max(0, p.pendingLeaves - 1) }));
            toast.success(`Leave ${status === 'Approved' ? '✅ Approved' : '❌ Rejected'} successfully`);
        } catch { toast.error('Failed to update leave status'); }
        finally { setLeaveActionLoading(p => ({ ...p, [id]: null })); }
    };

    const handleDownloadLeavePDF = (leave) => {
        downloadLeaveApplicationPDF(leave);
    };

    const handleAttOverride = async (e) => {
        e.preventDefault(); setAttLoading(true); setAttMsg('');
        try {
            await attendanceAdminAPI.override(attOverride);
            setAttMsg('success');
            setAttOverride(p => ({ ...p, employeeId: '', status: 'Present' }));
            toast.success('Attendance overridden successfully');
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to override attendance';
            setAttMsg(msg);
            toast.error(msg);
        }
        finally { setAttLoading(false); setTimeout(() => setAttMsg(''), 3000); }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault(); setEmpLoading(true); setEmpMsg('');
        try {
            await employeesAPI.add(empForm);
            setEmpMsg('success');
            setEmpForm({ name: '', email: '', password: '', department: '', salary: '' });
            toast.success(`Employee "${empForm.name}" added successfully`);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to add employee';
            setEmpMsg(msg);
            toast.error(msg);
        }
        finally { setEmpLoading(false); setTimeout(() => setEmpMsg(''), 3000); }
    };

    const handleSalaryUpdate = async (e) => {
        e.preventDefault(); setSalaryLoading(true); setSalaryMsg('');
        try {
            await employeesAPI.update(salaryForm.employeeId, { salary: Number(salaryForm.salary) });
            const empName = allEmployees.find(e => e._id === salaryForm.employeeId)?.name || 'Employee';
            setSalaryMsg('success');
            setSalaryForm({ employeeId: '', salary: '' });
            toast.success(`Salary updated for ${empName}`);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to update salary';
            setSalaryMsg(msg);
            toast.error(msg);
        }
        finally { setSalaryLoading(false); setTimeout(() => setSalaryMsg(''), 3000); }
    };

    const handleEmployeeSearch = async (e) => {
        e.preventDefault();
        const id = employeeSearchId.trim();
        if (!id) return;
        setEmployeeSearchLoading(true);
        setEmployeeSearchError('');
        setEmployeeSearchResult(null);
        try {
            const res = await employeesAPI.getByEmployeeId(id);
            setEmployeeSearchResult(res.data.data);
        } catch (err) {
            setEmployeeSearchError(err.response?.data?.error || 'Employee not found');
        } finally {
            setEmployeeSearchLoading(false);
        }
    };

    const statusBadge = s => ({ Approved: 'badge-success', Rejected: 'badge-danger', Pending: 'badge-warning' }[s] || 'badge-warning');

    const quickActions = [
        {
            label: 'Employees', icon: Users, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.18)',
            stat: stats.employees, statLabel: 'Total',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/employees') },
                { label: '+ Add', onClick: () => { setActionTab('employee'); document.getElementById('admin-actions-panel')?.scrollIntoView({ behavior: 'smooth' }); } }
            ]
        },
        {
            label: 'Departments', icon: Building2, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.18)',
            stat: stats.departments, statLabel: 'Total',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/departments') },
                { label: '+ Add', onClick: () => navigate('/admin/departments') }
            ]
        },
        {
            label: 'Attendance', icon: Clock, color: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.18)',
            stat: stats.presentToday, statLabel: 'Present Today',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/attendance') },
                { label: 'Override', onClick: () => { setActionTab('attendance'); document.getElementById('admin-actions-panel')?.scrollIntoView({ behavior: 'smooth' }); } }
            ]
        },
        {
            label: 'Leaves', icon: Calendar, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)',
            stat: stats.pendingLeaves, statLabel: 'Pending',
            badge: stats.pendingLeaves > 0,
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/leaves') },
                { label: 'Approve', onClick: () => { setActionTab('leaves'); document.getElementById('admin-actions-panel')?.scrollIntoView({ behavior: 'smooth' }); } }
            ]
        },
        {
            label: 'Payroll', icon: DollarSign, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.18)',
            stat: `₹${Math.round(stats.totalEarnedSalary / 1000)}k`, statLabel: 'Earned This Month',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/payroll') },
                { label: 'Update', onClick: () => { setActionTab('salary'); document.getElementById('admin-actions-panel')?.scrollIntoView({ behavior: 'smooth' }); } }
            ]
        },
        {
            label: 'Recruitment', icon: Briefcase, color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.18)',
            stat: '—', statLabel: 'Pipeline',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/recruitment') },
                { label: '+ Add', onClick: () => navigate('/admin/recruitment') }
            ]
        },
        {
            label: 'Performance', icon: TrendingUp, color: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.18)',
            stat: '—', statLabel: 'Reviews',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/performance') }
            ]
        },
        {
            label: 'Reports', icon: BarChart2, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.18)',
            stat: '—', statLabel: 'Analytics',
            actions: [
                { label: 'View All', onClick: () => navigate('/admin/reports') }
            ]
        },
    ];

    const adminActiveTime = now - loginTime.current;

    if (loading) return <PageLoader text="Loading dashboard..." />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Header with Live Clock */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Welcome back, {user?.name} 👋</h2>
                    <p className="page-subtitle">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Live Clock */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: '0.625rem', color: 'white' }}>
                        <Clock size={14} color="#4F46E5" />
                        <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em', color: '#E2E8F0' }}>
                            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                    </div>
                    {/* Admin Active Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'rgba(79,70,229,0.08)', borderRadius: '0.625rem', border: '1px solid rgba(79,70,229,0.15)' }}>
                        <Timer size={13} color="#4F46E5" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4F46E5' }}>Active: {formatDuration(adminActiveTime)}</span>
                    </div>
                    <HolidayCalendar isAdmin={true} />
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/employees')}><UserPlus size={15} /> Add Employee</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/reports')}><BarChart2 size={15} /> Reports</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-auto">
                <StatCard icon={<Users />} label="Total Employees" value={stats.employees} change={8} color="#4F46E5" bg="rgba(79,70,229,0.1)" onClick={() => navigate('/admin/employees')} />
                <StatCard icon={<Building2 />} label="Departments" value={stats.departments} color="#10B981" bg="rgba(16,185,129,0.1)" onClick={() => navigate('/admin/departments')} />
                <StatCard icon={<Calendar />} label="Pending Leaves" value={stats.pendingLeaves} change={-3} color="#F59E0B" bg="rgba(245,158,11,0.1)" onClick={() => navigate('/admin/leaves')} />
                <StatCard icon={<DollarSign />} label="Earned This Month" value={`₹${stats.totalEarnedSalary.toLocaleString()}`} change={5} color="#8B5CF6" bg="rgba(139,92,246,0.1)" onClick={() => navigate('/admin/payroll')} />
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                        <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: '#0F172A' }}>Search employee by ID or name</p>
                        <form onSubmit={handleEmployeeSearch} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                            <input className="form-input" placeholder="Enter employee ID or name..." value={employeeSearchId} onChange={e => setEmployeeSearchId(e.target.value)} />
                            <button type="submit" className="btn btn-primary" disabled={employeeSearchLoading} style={{ whiteSpace: 'nowrap' }}>
                                {employeeSearchLoading ? <><span className="btn-spinner" /> Searching...</> : 'Find'}
                            </button>
                        </form>
                        {employeeSearchError && <p style={{ margin: '0.75rem 0 0', color: '#EF4444', fontSize: '0.85rem' }}>{employeeSearchError}</p>}
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/employees')}>View all employees</button>
                </div>
                {employeeSearchResult && (() => {
                    const emp = employeeSearchResult.employee;
                    const attendanceRate = employeeSearchResult.totalDays > 0 ? Math.round((employeeSearchResult.presentDays / employeeSearchResult.totalDays) * 100) : 0;
                    return (
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: `hsl(${emp.name.charCodeAt(0)*10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '3px solid #E5E7EB' }}>
                                    {emp.photo ? <img src={emp.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>{emp.name.charAt(0).toUpperCase()}</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{emp.name}</p>
                                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>{emp.email}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                                        <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontFamily: 'monospace' }}>{emp.employeeId || '—'}</span>
                                        {emp.department?.name && <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>{emp.department.name}</span>}
                                        {emp.technology && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>{emp.technology}</span>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>₹{(emp.salary || 0).toLocaleString()}</p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8' }}>Gross Salary</p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
                                {[
                                    { label: 'Phone', value: emp.phone || '—' },
                                    { label: 'Designation', value: emp.designation || '—' },
                                    { label: 'Date Joined', value: new Date(emp.dateJoined || emp.createdAt || Date.now()).toLocaleDateString('en-IN') },
                                    { label: 'Role', value: emp.role || 'employee' },
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', border: '1px solid #F1F5F9' }}>
                                        <p style={{ margin: 0, fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</p>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Attendance Stats */}
                            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '0.625rem', padding: '0.875rem', marginBottom: '1rem' }}>
                                <p style={{ margin: '0 0 0.625rem', fontWeight: 700, fontSize: '0.78rem', color: '#065F46' }}>Attendance Summary</p>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Present', val: employeeSearchResult.presentDays, color: '#10B981' },
                                        { label: 'Absent', val: employeeSearchResult.absentDays, color: '#EF4444' },
                                        { label: 'On Leave', val: employeeSearchResult.leaveDays, color: '#F59E0B' },
                                        { label: 'Total Days', val: employeeSearchResult.totalDays, color: '#4F46E5' },
                                        { label: 'Attendance %', val: `${attendanceRate}%`, color: attendanceRate >= 75 ? '#10B981' : '#EF4444' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.val}</p>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Leaves */}
                            {employeeSearchResult.leaves?.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.78rem', color: '#0F172A' }}>Recent Leave Requests</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '140px', overflowY: 'auto' }}>
                                        {employeeSearchResult.leaves.slice(0, 5).map(lv => (
                                            <div key={lv._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '0.5rem', fontSize: '0.78rem' }}>
                                                <span style={{ flex: 1, color: '#0F172A', fontWeight: 600 }}>{lv.reason || 'Leave'}</span>
                                                <span style={{ color: '#64748B' }}>{new Date(lv.startDate).toLocaleDateString('en-IN')} – {new Date(lv.endDate).toLocaleDateString('en-IN')}</span>
                                                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: lv.status === 'Approved' ? '#D1FAE5' : lv.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', color: lv.status === 'Approved' ? '#065F46' : lv.status === 'Rejected' ? '#991B1B' : '#92400E' }}>{lv.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button onClick={() => navigate(`/admin/employees/${emp._id}/profile`)} className="btn btn-primary" style={{ fontSize: '0.8rem' }}><Eye size={14} /> View Full Profile</button>
                                <button onClick={() => { setEmployeeSearchId(''); setEmployeeSearchResult(null); setEmployeeSearchError(''); }} className="btn btn-outline" style={{ fontSize: '0.8rem' }}><X size={14} /> Clear</button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Attendance Today */}
            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg,rgba(236,72,153,0.05),rgba(79,70,229,0.05))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color="#EC4899" /> Today's Attendance
                    </p>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate('/admin/attendance')}>View Details</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div className="progress-bar" style={{ height: '10px' }}>
                            <div className="progress-fill" style={{ width: `${stats.employees ? (stats.presentToday / stats.employees) * 100 : 0}%`, background: 'linear-gradient(90deg,#10B981,#059669)' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {[{ label: 'Present', val: stats.presentToday, color: '#10B981' }, { label: 'Absent', val: stats.absentToday, color: '#EF4444' }, { label: 'Rate', val: `${stats.employees ? Math.round((stats.presentToday / stats.employees) * 100) : 0}%`, color: '#4F46E5' }].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>{s.label}</p>
                                <p style={{ margin: '0.1rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Employee Check-in Timings */}
            {todayAttendance.length > 0 && (
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Timer size={16} color="#4F46E5" /> Today's Check-in Timings
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{todayAttendance.length} records</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '0.625rem' }}>
                        {todayAttendance.slice(0, 8).map(att => {
                            const checkInTime = att.checkIn ? new Date(att.checkIn) : null;
                            const checkOutTime = att.checkOut ? new Date(att.checkOut) : null;
                            const duration = checkInTime ? (checkOutTime ? checkOutTime - checkInTime : now - checkInTime) : null;
                            return (
                                <div key={att._id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', background: '#F8FAFC', borderRadius: '0.625rem', border: '1px solid #F1F5F9' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: `hsl(${(att.employee?.name || 'A').charCodeAt(0) * 10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {att.employee?.photo ? <img src={att.employee.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{(att.employee?.name || 'A').charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.78rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.employee?.name || 'Employee'}</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                                            {checkInTime && <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>In: {checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                            {checkOutTime && <span style={{ fontSize: '0.65rem', color: '#EF4444', fontWeight: 600 }}>Out: {checkOutTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                        </div>
                                        {locationNames[att._id] ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${att.location?.lat},${att.location?.lng}`}
                                                target="_blank" rel="noreferrer"
                                                title={locationNames[att._id].display}
                                                style={{ marginTop: '0.25rem', fontSize: '0.62rem', color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.2rem', textDecoration: 'none', lineHeight: 1.4 }}>
                                                <MapPin size={10} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                                <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {locationNames[att._id].name}
                                                </span>
                                            </a>
                                        ) : att.location?.lat ? (
                                            <span style={{ marginTop: '0.2rem', fontSize: '0.6rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                                                <MapPin size={9} /> Fetching address...
                                            </span>
                                        ) : (
                                            <span style={{ marginTop: '0.2rem', fontSize: '0.6rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                                                <MapPin size={9} /> No location
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        {duration && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4F46E5', background: 'rgba(79,70,229,0.08)', padding: '0.15rem 0.4rem', borderRadius: '9999px' }}>{formatDuration(duration)}</span>}
                                        {!checkOutTime && checkInTime && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginTop: '0.25rem', marginLeft: 'auto', animation: 'pulse 2s infinite' }} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Quick Actions</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem' }}>
                    {quickActions.map((a, i) => {
                        const Icon = a.icon;
                        return (
                            <div key={i} style={{ background: a.bg, border: `1.5px solid ${a.border}`, borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', transition: 'all 0.15s', position: 'relative' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                {/* Badge for pending items */}
                                {a.badge && (
                                    <span style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                        {stats.pendingLeaves}
                                    </span>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                        <Icon size={16} color={a.color} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0F172A' }}>{a.label}</span>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: a.color, lineHeight: 1 }}>{a.stat}</p>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 500 }}>{a.statLabel}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                    {a.actions.map((act, j) => (
                                        <button key={j} onClick={act.onClick}
                                            style={{ flex: 1, padding: '0.3rem 0.5rem', background: 'white', border: `1px solid ${a.border}`, borderRadius: '0.375rem', color: a.color, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = a.color; }}>
                                            {act.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Admin Actions Panel ── */}
            <div id="admin-actions-panel" className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Zap size={16} color="#4F46E5" />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Admin Actions</p>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94A3B8' }}>Take action without leaving dashboard</span>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {[
                            { key: 'leaves', label: `Pending Leaves (${allLeaves.length})`, color: '#F59E0B' },
                            { key: 'attendance', label: 'Override Attendance', color: '#EC4899' },
                            { key: 'employee', label: 'Add Employee', color: '#4F46E5' },
                            { key: 'salary', label: 'Update Salary', color: '#10B981' },
                            { key: 'notifications', label: 'Send Notification', color: '#4F46E5' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActionTab(t.key)}
                            style={{ padding: '0.35rem 0.875rem', borderRadius: '9999px', border: `1.5px solid ${actionTab === t.key ? t.color : '#E2E8F0'}`, background: actionTab === t.key ? t.color + '18' : '#fff', color: actionTab === t.key ? t.color : '#64748B', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Pending Leaves */}
                {actionTab === 'leaves' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '320px', overflowY: 'auto' }}>
                        {allLeaves.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.8rem' }}>
                                <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                                No pending leave requests
                            </div>
                        )}
                        {allLeaves.map(leave => {
                            const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1;
                            const loading = leaveActionLoading[leave._id];
                            return (
                                <div key={leave._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '0.625rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `hsl(${(leave.employee?.name||'A').charCodeAt(0)*10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{(leave.employee?.name||'A').charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>{leave.employee?.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#92400E' }}>
                                            {new Date(leave.startDate).toLocaleDateString('en-IN')} – {new Date(leave.endDate).toLocaleDateString('en-IN')} · {days}d
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                                        <button onClick={() => handleLeaveAction(leave._id, 'Approved')} disabled={!!loading}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.625rem', background: loading === 'Approved' ? '#D1FAE5' : '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '0.375rem', color: '#065F46', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <CheckCircle size={12} /> {loading === 'Approved' ? '...' : 'Approve'}
                                        </button>
                                        <button onClick={() => setRejectLeave(leave)} disabled={!!loading}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.625rem', background: loading === 'Rejected' ? '#FEE2E2' : '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: '0.375rem', color: '#991B1B', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <XCircle size={12} /> {loading === 'Rejected' ? '...' : 'Reject'}
                                        </button>
                                        <button onClick={() => { setSelectedLeave(leave); setShowView(true); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.625rem', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '0.375rem', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Eye size={12} /> View
                                        </button>
                                        <button onClick={() => handleDownloadLeavePDF(leave)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.625rem', background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '0.375rem', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <Download size={12} /> PDF
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tab: Attendance Override */}
                {showView && selectedLeave && <LeaveViewModal leave={selectedLeave} onClose={() => { setShowView(false); setSelectedLeave(null); }} />}
                {rejectLeave && <RejectModal leave={rejectLeave} onConfirm={async (reason) => { await handleLeaveAction(rejectLeave._id, 'Rejected', reason); setRejectLeave(null); }} onClose={() => setRejectLeave(null)} />}

                {actionTab === 'attendance' && (
                    <form onSubmit={handleAttOverride} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Employee</label>
                            <select className="form-input" value={attOverride.employeeId} onChange={e => setAttOverride(p => ({ ...p, employeeId: e.target.value }))} required>
                                <option value="">Select Employee</option>
                                {allEmployees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Date</label>
                            <input type="date" className="form-input" value={attOverride.date} onChange={e => setAttOverride(p => ({ ...p, date: e.target.value }))} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Status</label>
                            <select className="form-input" value={attOverride.status} onChange={e => setAttOverride(p => ({ ...p, status: e.target.value }))}>
                                <option>Present</option>
                                <option>Absent</option>
                                <option>On Leave</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={attLoading} style={{ whiteSpace: 'nowrap' }}>
                                <UserCheck size={14} /> {attLoading ? <><span className="btn-spinner" /> Saving...</> : 'Override'}
                            </button>
                            {attMsg === 'success' && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>✓ Done</span>}
                            {attMsg && attMsg !== 'success' && <span style={{ fontSize: '0.7rem', color: '#EF4444' }}>{attMsg}</span>}
                        </div>
                    </form>
                )}

                {/* Tab: Add Employee */}
                {actionTab === 'employee' && (
                    <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Full Name</label>
                            <input className="form-input" placeholder="John Doe" value={empForm.name} onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))} required minLength={2} maxLength={50} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" placeholder="john@company.com" value={empForm.email} onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Password</label>
                            <input type="password" className="form-input" placeholder="••••••••" value={empForm.password} onChange={e => setEmpForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Department</label>
                            <select className="form-input" value={empForm.department} onChange={e => setEmpForm(p => ({ ...p, department: e.target.value }))} required>
                                <option value="">Select</option>
                                {allDepts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Technology</label>
                            <select className="form-input" value={empForm.technology} onChange={e => setEmpForm(p => ({ ...p, technology: e.target.value }))} required>
                                <option value="">Select</option>
                                {['React', 'Node.js', 'Angular', 'Vue.js', 'Python', 'Java', 'C#', 'DevOps', 'UI/UX', 'Data Science'].map(tech => <option key={tech} value={tech}>{tech}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Salary (₹)</label>
                            <input type="number" className="form-input" placeholder="60000" value={empForm.salary} onChange={e => setEmpForm(p => ({ ...p, salary: e.target.value }))} required min={1000} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={empLoading}>
                                {empLoading ? <><span className="btn-spinner" /> Adding...</> : <><Plus size={14} /> Add</>}
                            </button>
                            {empMsg === 'success' && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>✓ Employee added</span>}
                            {empMsg && empMsg !== 'success' && <span style={{ fontSize: '0.7rem', color: '#EF4444' }}>{empMsg}</span>}
                        </div>
                    </form>
                )}

                {/* Tab: Update Salary */}
                {actionTab === 'salary' && (
                    <form onSubmit={handleSalaryUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Employee</label>
                            <select className="form-input" value={salaryForm.employeeId} onChange={e => setSalaryForm(p => ({ ...p, employeeId: e.target.value }))} required>
                                <option value="">Select Employee</option>
                                {allEmployees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} — ₹{(emp.salary||0).toLocaleString()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">New Gross Salary (₹)</label>
                            <input type="number" className="form-input" placeholder="e.g. 75000" value={salaryForm.salary} onChange={e => setSalaryForm(p => ({ ...p, salary: e.target.value }))} required min={1000} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={salaryLoading} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', whiteSpace: 'nowrap' }}>
                                {salaryLoading ? <><span className="btn-spinner" /> Updating...</> : <><Edit2 size={14} /> Update</>}
                            </button>
                            {salaryMsg === 'success' && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>✓ Salary updated</span>}
                            {salaryMsg && salaryMsg !== 'success' && <span style={{ fontSize: '0.7rem', color: '#EF4444' }}>{salaryMsg}</span>}
                        </div>
                    </form>
                )}
                {/* Tab: Notifications */}
                {actionTab === 'notifications' && (
                    <form onSubmit={async (e) => {
                        e.preventDefault(); setNotifLoading(true); setNotifMsg('');
                        try {
                            const payload = { message: notifForm.message, type: notifForm.type, link: notifForm.link };
                            if (!notifForm.targetAll && notifForm.userIds.length > 0) payload.userIds = notifForm.userIds;
                            await notificationsAPI.send(payload);
                            setNotifMsg('success');
                            setNotifForm({ message: '', type: 'General', link: '', targetAll: true, userIds: [] });
                            toast.success('Notification sent');
                        } catch (err) {
                            const m = err.response?.data?.error || 'Failed to send notification';
                            setNotifMsg(m);
                            toast.error(m);
                        } finally { setNotifLoading(false); setTimeout(() => setNotifMsg(''), 3000); }
                    }} style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '0.75rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Message</label>
                            <input className="form-input" placeholder="Announcement to employees" value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Type</label>
                            <select className="form-input" value={notifForm.type} onChange={e => setNotifForm(p => ({ ...p, type: e.target.value }))}>
                                <option>General</option>
                                <option>HR</option>
                                <option>Attendance</option>
                                <option>Payroll</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={notifForm.targetAll} onChange={e => setNotifForm(p => ({ ...p, targetAll: e.target.checked }))} />
                                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Send to all</span>
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={notifLoading} style={{ whiteSpace: 'nowrap' }}>
                                    {notifLoading ? <><span className="btn-spinner" /> Sending...</> : 'Send'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Recent Employees & Leaves */}
            <div className="grid-2">
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Recent Employees</p>
                        <button onClick={() => navigate('/admin/employees')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>View all <ArrowUpRight size={13} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {recentEmployees.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No employees yet</p>}
                        {recentEmployees.map(emp => (
                            <div key={emp._id} onClick={() => navigate(`/admin/employees/${emp._id}/profile`)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.625rem', transition: 'background 0.15s', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: `hsl(${emp.name.charCodeAt(0)*10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {emp.photo ? <img src={emp.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{emp.name?.charAt(0).toUpperCase()}</span>}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{emp.department?.name || '—'} · {new Date(emp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>₹{(emp.salary || 0).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Recent Leave Requests</p>
                        <button onClick={() => navigate('/admin/leaves')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>View all <ArrowUpRight size={13} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {recentLeaves.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No leave requests</p>}
                        {recentLeaves.map(leave => (
                            <div key={leave._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.625rem', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>{leave.employee?.name?.charAt(0).toUpperCase()}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.employee?.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{new Date(leave.startDate).toLocaleDateString()}</p>
                                </div>
                                <span className={`badge ${statusBadge(leave.status)}`}>{leave.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Candidate Applications */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Recent Applications</p>
                    <button onClick={() => navigate('/admin/recruitment')} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>View all <ArrowUpRight size={13} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {recentCandidates.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No applications yet</p>}
                    {recentCandidates.map(c => (
                        <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.625rem', transition: 'background 0.15s' }}>
                            <div className="avatar avatar-sm" style={{ background: `hsl(${(c.name||'A').charCodeAt(0)*10},65%,55%)` }}>{(c.name||'A').charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>{c.name} — <span style={{ fontWeight: 500, color: '#64748B' }}>{c.role}</span></p>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{c.email || c.phone || '—'}</p>
                            </div>
                            {c.cv ? (
                                <a href={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + c.cv} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View CV</a>
                            ) : (
                                <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>No CV</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
