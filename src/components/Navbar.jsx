import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, X, CheckCheck, Mail, Building2, IndianRupee, LogOut, Settings, Camera, Phone, Briefcase, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ConfirmModal = ({ title, message, subMessage, confirmLabel, confirmColor, onConfirm, onCancel, icon }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
        onClick={e => e.target === e.currentTarget && onCancel()}>
        <div style={{ background: '#fff', borderRadius: '1.25rem', width: '100%', maxWidth: '400px', boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflowY: 'auto', maxHeight: '90vh', animation: 'fadeInScale 0.18s ease', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.875rem 0.875rem 0' }}>
                <button onClick={onCancel} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}>
                    <X size={15} />
                </button>
            </div>
            <div style={{ padding: '0.5rem 1.75rem 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: confirmColor + '18', border: `2px solid ${confirmColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    {icon}
                </div>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{title}</p>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>{message}</p>
                {subMessage && <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>{subMessage}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem 1.75rem' }}>
                <button onClick={onCancel} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>
                    <X size={15} /> Cancel
                </button>
                <button onClick={onConfirm} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: confirmColor, border: 'none', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: `0 4px 12px ${confirmColor}40`, transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <LogOut size={15} /> {confirmLabel}
                </button>
            </div>
        </div>
        <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
);

const Navbar = ({ title }) => {
    const { user, logout, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchResults, setSearchResults] = useState({ pages: [], employees: [], departments: [] });
    const [searchLoading, setSearchLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '', designation: '', department: '', photo: '' });
    const [departments, setDepartments] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const searchRef = useRef(null);
    const fileRef = useRef(null);
    const searchTimer = useRef(null);

    const skipSearchClose = useRef(false);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) { setShowProfile(false); setEditMode(false); setSaveMsg(''); }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                if (!skipSearchClose.current) setShowSearch(false);
                skipSearchClose.current = false;
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Called on mousedown of any result item — prevents dropdown from closing
    const handleResultMouseDown = (e) => {
        e.preventDefault();
        skipSearchClose.current = true;
    };

    // Navigate to a search result
    const goTo = (path) => {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults({ pages: allPages, employees: [], departments: [] });
        navigate(path);
    };

    useEffect(() => {
        notificationsAPI.getAll().then(r => setNotifications(r.data.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (user) setEditData({ name: user.name || '', phone: user.phone || '', designation: user.designation || '', department: user.department?._id || '', photo: user.photo || '' });
    }, [user]);

    useEffect(() => {
        authAPI.getDepartments().then(r => setDepartments(r.data.data || [])).catch(() => {});
    }, []);

    const markRead = (id, link) => {
        setShowNotif(false);
        setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
        notificationsAPI.markRead(id).catch(() => {});
        if (link) {
            navigate(link);
        } else {
            navigate(user?.role === 'admin' ? '/admin' : '/employee');
        }
    };

    const markAllRead = async () => {
        await notificationsAPI.markAllRead().catch(() => {});
        setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 400 / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            setEditData(d => ({ ...d, photo: canvas.toDataURL('image/jpeg', 0.7) }));
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleSave = async () => {
        setSaving(true); setSaveMsg('');
        try {
            await updateProfile({ name: editData.name, phone: editData.phone, designation: editData.designation, department: editData.department, photo: editData.photo });
            setSaveMsg('success');
            setTimeout(() => { setEditMode(false); setSaveMsg(''); }, 1000);
        } catch (err) {
            setSaveMsg(err?.response?.data?.error || 'Failed to save');
        }
        setSaving(false);
    };

    const unread = notifications.filter(n => !n.isRead).length;

    const allPages = user?.role === 'admin'
        ? [
            { label: 'Dashboard',       icon: '🏠', path: '/admin' },
            { label: 'Employees',        icon: '👥', path: '/admin/employees' },
            { label: 'Departments',      icon: '🏢', path: '/admin/departments' },
            { label: 'Attendance',       icon: '🕐', path: '/admin/attendance' },
            { label: 'Leave Approvals',  icon: '📅', path: '/admin/leaves' },
            { label: 'Payroll',          icon: '💰', path: '/admin/payroll' },
            { label: 'Recruitment',      icon: '💼', path: '/admin/recruitment' },
            { label: 'Performance',      icon: '📈', path: '/admin/performance' },
            { label: 'Reports',          icon: '📊', path: '/admin/reports' },
            { label: 'Access Control',   icon: '🔐', path: '/admin/access' },
            { label: 'Settings',         icon: '⚙️', path: '/admin/settings' },
          ]
        : [
            { label: 'Dashboard',      icon: '🏠', path: '/employee' },
            { label: 'My Profile',     icon: '👤', path: '/employee/profile' },
            { label: 'Leave Requests', icon: '📅', path: '/employee/leaves' },
            { label: 'Attendance',     icon: '🕐', path: '/employee/attendance' },
            { label: 'Salary Details', icon: '💰', path: '/employee/salary' },
            { label: 'Settings',       icon: '⚙️', path: '/employee/settings' },
          ];

    // Debounced global search
    const handleSearchChange = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        setShowSearch(true);
        clearTimeout(searchTimer.current);
        if (!q.trim()) {
            setSearchResults({ pages: allPages, employees: [], departments: [] });
            return;
        }
        const matchedPages = allPages.filter(p => p.label.toLowerCase().includes(q.toLowerCase()));
        setSearchResults(prev => ({ ...prev, pages: matchedPages }));
        if (user?.role === 'admin') {
            setSearchLoading(true);
            searchTimer.current = setTimeout(async () => {
                try {
                    const [empRes, deptRes] = await Promise.all([
                        import('../services/api').then(m => m.employeesAPI.getAll()),
                        import('../services/api').then(m => m.departmentsAPI.getAll()),
                    ]);
                    const ql = q.toLowerCase();
                    const employees = (empRes.data.data || []).filter(e =>
                        e.name?.toLowerCase().includes(ql) ||
                        e.email?.toLowerCase().includes(ql) ||
                        e.employeeId?.toLowerCase().includes(ql) ||
                        e.designation?.toLowerCase().includes(ql) ||
                        e.technology?.toLowerCase().includes(ql)
                    ).slice(0, 5);
                    const departments = (deptRes.data.data || []).filter(d =>
                        d.name?.toLowerCase().includes(ql) ||
                        d.hodName?.toLowerCase().includes(ql)
                    ).slice(0, 3);
                    setSearchResults({ pages: matchedPages, employees, departments });
                } catch {}
                setSearchLoading(false);
            }, 350);
        }
    };

    const hasResults = searchQuery.trim()
        ? (searchResults.pages.length + searchResults.employees.length + searchResults.departments.length) > 0
        : true;

    const avatarBg = user?.role === 'admin' ? 'linear-gradient(135deg,#7C3AED,#4C1D95)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)';

    return (
        <>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50, gap: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>{title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Search */}
                <div ref={searchRef} style={{ position: 'relative' }}>
                    <div className="search-bar" style={{ width: '220px' }}>
                        <Search size={15} color="#94A3B8" />
                        <input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                setShowSearch(true);
                                if (!searchQuery.trim()) setSearchResults({ pages: allPages, employees: [], departments: [] });
                            }}
                        />
                        {searchQuery && (
                            <button
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => { setSearchQuery(''); setSearchResults({ pages: allPages, employees: [], departments: [] }); setShowSearch(false); }}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
                            ><X size={14} /></button>
                        )}
                    </div>

                    {showSearch && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '300px',
                            background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.875rem',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden',
                            maxHeight: '420px', overflowY: 'auto'
                        }}>
                            {/* Header */}
                            <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {searchQuery.trim() ? `Search: "${searchQuery}"` : 'Quick Navigation'}
                                </span>
                                {searchLoading && <span className="btn-spinner-dark" style={{ width: '12px', height: '12px' }} />}
                            </div>

                            {!hasResults && (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                                    No results for "{searchQuery}"
                                </div>
                            )}

                            {/* Pages */}
                            {searchResults.pages.length > 0 && (
                                <div>
                                    <div style={{ padding: '0.4rem 0.875rem', fontSize: '0.65rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F8FAFC' }}>
                                        Pages
                                    </div>
                                    {searchResults.pages.map((item, i) => (
                                        <div
                                            key={i}
                                            onMouseDown={handleResultMouseDown}
                                            onClick={() => goTo(item.path)}
                                            style={{ padding: '0.55rem 0.875rem', cursor: 'pointer', fontSize: '0.85rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                                            <span style={{ fontWeight: 500 }}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Employees */}
                            {searchResults.employees.length > 0 && (
                                <div>
                                    <div style={{ padding: '0.4rem 0.875rem', fontSize: '0.65rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F8FAFC' }}>
                                        Employees
                                    </div>
                                    {searchResults.employees.map((emp, i) => (
                                        <div
                                            key={i}
                                            onMouseDown={handleResultMouseDown}
                                            onClick={() => goTo(`/admin/employees/${emp._id}/profile`)}
                                            style={{ padding: '0.55rem 0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `hsl(${(emp.name||'A').charCodeAt(0)*10},65%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                {emp.photo
                                                    ? <img src={emp.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>{(emp.name||'A').charAt(0).toUpperCase()}</span>
                                                }
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {emp.employeeId ? `${emp.employeeId} · ` : ''}{emp.department?.name || emp.designation || emp.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Departments */}
                            {searchResults.departments.length > 0 && (
                                <div>
                                    <div style={{ padding: '0.4rem 0.875rem', fontSize: '0.65rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F8FAFC' }}>
                                        Departments
                                    </div>
                                    {searchResults.departments.map((dept, i) => (
                                        <div
                                            key={i}
                                            onMouseDown={handleResultMouseDown}
                                            onClick={() => goTo('/admin/departments')}
                                            style={{ padding: '0.55rem 0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>🏢</span>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{dept.name}</p>
                                                {dept.hodName && <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8' }}>HOD: {dept.hodName}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotif(!showNotif)} style={{ position: 'relative', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem', borderRadius: '0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'} onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
                        <Bell size={17} color="#64748B" />
                        {unread > 0 && (
                            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 700, minWidth: '16px', height: '16px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', padding: '0 3px' }}>
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>
                    {showNotif && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.875rem', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>Notifications {unread > 0 && <span style={{ background: '#EF4444', color: 'white', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.7rem', marginLeft: '0.25rem' }}>{unread}</span>}</p>
                                {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCheck size={13} /> Mark all read</button>}
                            </div>
                            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                {notifications.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>No notifications</div>}
                                {notifications.map(n => (
                                    <div key={n._id} onClick={() => markRead(n._id, n.link)}
                                        style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(79,70,229,0.03)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F0F4FF'}
                                        onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(79,70,229,0.03)'}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? '#E2E8F0' : '#4F46E5', marginTop: '5px', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: n.isRead ? '#64748B' : '#0F172A', fontWeight: n.isRead ? 400 : 600, lineHeight: 1.4 }}>{n.message}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8' }}>{new Date(n.createdAt).toLocaleString()}</p>
                                                    {n.link && <span style={{ fontSize: '0.65rem', color: '#4F46E5', fontWeight: 600 }}>View →</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                    <button onClick={() => { setShowProfile(!showProfile); setEditMode(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.625rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.625rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'} onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {user?.photo ? <img src={user.photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>{user?.name}</p>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94A3B8', textTransform: 'capitalize' }}>{user?.role}</p>
                        </div>
                    </button>

                    {showProfile && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                            {/* Profile Header */}
                            <div style={{ background: user?.role === 'admin' ? 'linear-gradient(135deg,#7C3AED,#4C1D95)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '1.25rem', textAlign: 'center', position: 'relative' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.4)', margin: '0 auto' }}>
                                        {(editMode ? editData.photo : user?.photo) ? <img src={editMode ? editData.photo : user.photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '1.75rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                                    </div>
                                    {editMode && (
                                        <button onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                                            <Camera size={13} color="#4F46E5" />
                                        </button>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                </div>
                                {!editMode ? (
                                    <>
                                        <p style={{ margin: '0.5rem 0 0.1rem', fontWeight: 700, fontSize: '1rem', color: 'white' }}>{user?.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{user?.designation || user?.role}</p>
                                    </>
                                ) : (
                                    <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.375rem', color: 'white', padding: '0.3rem 0.5rem', fontSize: '0.875rem', width: '80%', textAlign: 'center', outline: 'none' }} maxLength={50} minLength={2} />
                                )}
                            </div>

                            {/* Details */}
                            <div style={{ padding: '1rem' }}>
                                {!editMode ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {[
                                            { icon: <Mail size={14} color="#4F46E5" />, label: 'Email', value: user?.email },
                                            { icon: <Building2 size={14} color="#10B981" />, label: 'Department', value: user?.department?.name || '—' },
                                            { icon: <Briefcase size={14} color="#F59E0B" />, label: 'Designation', value: user?.designation || '—' },
                                            { icon: <Phone size={14} color="#06B6D4" />, label: 'Phone', value: user?.phone || '—' },
                                            ...(user?.salary ? [{ icon: <IndianRupee size={14} color="#8B5CF6" />, label: 'Salary', value: `₹${user.salary.toLocaleString('en-IN')}` }] : []),
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', background: '#F8FAFC', borderRadius: '0.5rem' }}>
                                                <div style={{ flexShrink: 0 }}>{item.icon}</div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#0F172A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {[
                                            { label: 'Department', key: 'department', type: 'select' },
                                            { label: 'Phone', key: 'phone' },
                                            { label: 'Designation', key: 'designation', placeholder: 'e.g. Software Engineer', maxLength: 60 },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                                                {f.type === 'select' ? (
                                                    <select
                                                        value={editData.department}
                                                        onChange={e => setEditData(d => ({ ...d, department: e.target.value }))}
                                                        style={{ width: '100%', padding: '0.5rem 0.625rem', border: '1px solid #E2E8F0', borderRadius: '0.375rem', fontSize: '0.8rem', outline: 'none', marginTop: '0.2rem', boxSizing: 'border-box', background: '#fff', color: editData.department ? '#0F172A' : '#64748B' }}
                                                    >
                                                        <option value="">Select Department</option>
                                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                    </select>
                                                ) : f.key === 'phone' ? (
                                                    <input
                                                        type="tel"
                                                        value={editData.phone}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/[^0-9+]/g, '');
                                                            if (val.length <= 13) setEditData(d => ({ ...d, phone: val }));
                                                        }}
                                                        placeholder="9876543210"
                                                        maxLength={13}
                                                        minLength={10}
                                                        pattern="[0-9+]{10,13}"
                                                        title="Enter 10-digit mobile number"
                                                        style={{ width: '100%', padding: '0.5rem 0.625rem', border: '1px solid #E2E8F0', borderRadius: '0.375rem', fontSize: '0.8rem', outline: 'none', marginTop: '0.2rem', boxSizing: 'border-box' }}
                                                    />
                                                ) : (
                                                    <input
                                                        value={editData[f.key]}
                                                        onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                        maxLength={f.maxLength}
                                                        style={{ width: '100%', padding: '0.5rem 0.625rem', border: '1px solid #E2E8F0', borderRadius: '0.375rem', fontSize: '0.8rem', outline: 'none', marginTop: '0.2rem', boxSizing: 'border-box' }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexDirection: 'column' }}>
                                    {!editMode ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setEditMode(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.5rem', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#4F46E5', cursor: 'pointer' }}>
                                                <Settings size={14} /> Edit Profile
                                            </button>
                                            <button onClick={() => setShowLogoutConfirm(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.5rem', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {saveMsg && saveMsg !== 'success' && (
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#EF4444', background: '#FEE2E2', padding: '0.4rem 0.625rem', borderRadius: '0.375rem' }}>{saveMsg}</p>
                                            )}
                                            {saveMsg === 'success' && (
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#10B981', background: '#D1FAE5', padding: '0.4rem 0.625rem', borderRadius: '0.375rem' }}>✓ Saved successfully!</p>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => { setEditMode(false); setSaveMsg(''); }} style={{ flex: 1, padding: '0.5rem', background: '#F1F5F9', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                                                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '0.5rem', background: saving ? '#a5b4fc' : '#4F46E5', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'white', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                                    {saving ? <><span className="btn-spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} /> Saving...</> : 'Save Changes'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
        {showLogoutConfirm && (
            <ConfirmModal
                title="Sign Out"
                message={`Are you sure you want to sign out, ${user?.name}?`}
                subMessage="You will need to log in again to access the dashboard."
                confirmLabel="Yes, Sign Out"
                confirmColor="#EF4444"
                icon={<LogOut size={22} color="#EF4444" />}
                onConfirm={() => { setShowLogoutConfirm(false); toast.success('Signed out successfully'); logout(); }}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        )}
        </>
    );
};

export default Navbar;
